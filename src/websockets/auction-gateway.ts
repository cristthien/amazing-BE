import { BidService } from '@/src/bid/bid.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { convertTimeLeftToString } from '../common/helpers/utils';

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private auctions = new Map<
    string,
    {
      highestBid: number;
      highestBidder: string;
      createdAt: Date;
      endDate: Date;
      client: string[];
    }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly bidService: BidService,
  ) {}
  // Sử dụng jwtService
  decodeToken(token: string) {
    try {
      return this.jwtService.verify(token); // Giải mã token
    } catch (e: any) {
      console.error('Invalid token', e);
      return null;
    } finally {
      console.log(token);
    }
  }
  // Khi người dùng kết nối
  handleConnection(client: Socket) {
    console.log('User connected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected: ', client.id);

    // Duyệt qua tất cả các auction để tìm client
    for (const [slug, auction] of this.auctions.entries()) {
      // Kiểm tra nếu client tồn tại trong danh sách của auction
      const clientIndex = auction.client.indexOf(client.id);

      if (clientIndex !== -1) {
        // Xóa client khỏi danh sách
        auction.client.splice(clientIndex, 1);

        if (auction.client.length === 0) {
          // Nếu danh sách client trống, xóa luôn auction
          this.auctions.delete(slug);
          console.log(
            `Auction ${slug} has been deleted as no clients are left.`,
          );
        } else {
          // Nếu còn client khác, chỉ cập nhật danh sách
          console.log(
            `Client ${client.id} removed from auction ${slug}. Remaining clients: `,
            auction.client,
          );
        }
      }
    }
    console.log(this.auctions);
  }

  // Khi người dùng tham gia phòng đấu giá
  @SubscribeMessage('joinAuction')
  async handleJoinAuction(client: Socket, slug: string) {
    client.join(slug);
    console.log(`User ${client.id} joined auction for product ${slug}`);

    // Gửi trạng thái hiện tại của đấu giá cho người mới tham gia

    const bidList = await this.bidService.getBidsByAuctionSlug(slug);
    if (!bidList) {
      client.disconnect();
      return;
    }
    let auction = this.auctions.get(slug);
    console.log(bidList.end_date);
    // set auction
    if (!auction) {
      auction = {
        highestBid: bidList.highest_bid,
        highestBidder: null,
        createdAt: null,
        endDate: bidList.end_date,
        client: [client.id],
      };
      if (bidList.numOfBid == 0) {
        this.auctions.set(slug, auction);
      } else {
        auction = {
          highestBid: bidList.highest_bid,
          highestBidder: bidList.bids[0].username,
          createdAt: bidList.bids[0].createdAt,
          endDate: bidList.end_date,
          client: [client.id],
        };
        this.auctions.set(slug, auction);
      }
      this.handleTimeout(client, slug, auction);
    } else {
      const existingAuction = this.auctions.get(slug); // Lấy auction hiện tại
      if (!existingAuction.client.includes(client.id)) {
        // Kiểm tra nếu client.id chưa có trong danh sách
        existingAuction.client.push(client.id); // Thêm client.id
      }
    }
    client.emit('initalizeBid', bidList);
  }
  handleTimeout(client: Socket, slug: string, auction: any) {
    const now = new Date();
    const timeLeft = auction.endDate.getTime() - now.getTime();
    if (timeLeft > 3600000) {
      // set time  out  to handle Count Down
      const timeoutDuration = timeLeft - 3600000; // Thời gian đến khi còn đúng 1 giờ
      client.emit('timeleft', {
        timeleft: convertTimeLeftToString(timeLeft),
      });
      setTimeout(() => {
        this.handleCountDown(slug, 3600000); // Gọi countdown với thời gian còn lại là 1 giờ
      }, timeoutDuration);
    } else {
      this.handleCountDown(slug, timeLeft);
    }
  }

  handleCountDown(slug: string, timeLeft: number) {
    const intervalId = setInterval(() => {
      timeLeft -= 1000; // Giảm thời gian còn lại mỗi giây
      if (timeLeft <= 0) {
        clearInterval(intervalId); // Dừng interval khi hết thời gian
        console.log(`Auction ${slug} has ended.`);
        this.server.to(slug).emit('timeleft', {
          timeleft: 0,
        });
      } else {
        this.server.to(slug).emit('timeleft', {
          timeleft: convertTimeLeftToString(timeLeft),
        });
      }
    }, 1000); // Cập nhật mỗi giây
  }

  // Khi người dùng đặt giá mới
  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    client: Socket,
    data: { slug: string; bidAmount: number; accessToken: string },
  ) {
    try {
      const { slug, bidAmount, accessToken } = data;
      const decoded = this.decodeToken(accessToken);
      if (!decoded) {
        client.emit('bidFailed', { message: 'Unauthorized access' });
        return;
      }
      const auction = this.auctions.get(slug);

      if (auction && bidAmount > auction.highestBid) {
        const result = await this.bidService.createBid(
          { auctionSlug: slug, amount: bidAmount },
          decoded,
        );
        auction.highestBid = bidAmount;
        auction.highestBidder = result.user.username;
        auction.createdAt = result.createdAt;
        this.auctions.set(slug, auction);
        this.server.to(slug).emit('updateBid', auction);
      } else {
        throw new Error('Bid must be higher than the current highest bid.');
      }
    } catch (e: any) {
      console.log(e);
      client.emit('bidFailed', {
        message: e.message,
      });
    }
  }
}
