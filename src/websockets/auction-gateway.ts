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

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private auctions = new Map<
    string,
    { highestBid: number; highestBidder: string; createdAt: Date }
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
    // const rooms = Array.from(client.rooms).filter((room) => room !== client.id);
    console.log(client.rooms);
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
    const auction = this.auctions.get(slug);
    // set auction
    if (!auction) {
      if (bidList.numOfBid == 0) {
        this.auctions.set(slug, {
          highestBid: bidList.highest_bid,
          highestBidder: null,
          createdAt: null,
        });
      } else {
        this.auctions.set(slug, {
          highestBid: bidList.highest_bid,
          highestBidder: bidList.bids[0].username,
          createdAt: bidList.bids[0].createdAt,
        });
      }
    }
    client.emit('initalizeBid', bidList);
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
