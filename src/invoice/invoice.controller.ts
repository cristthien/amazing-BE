import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles } from '../common/decorator/roles.decorator';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // @Post()
  // create(@Body() createInvoiceDto: CreateInvoiceDto) {
  //   return this.invoiceService.create(createInvoiceDto);
  // }

  @Get('admin')
  findAllbyAdmin(
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10,
  ) {
    // Default to 10 items per page) {
    return this.invoiceService.findAllbyAdmin(+page, +limit);
  }
  @Get()
  @Roles('user')
  findAll(
    @Request() req: any,
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10,
  ) {
    // Default to 10 items per page) {
    return this.invoiceService.findAll(req.user, +page, +limit);
  }

  @Get(':id')
  @Roles('user')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.invoiceService.findOne(+id, req.user);
  }

  @Patch(':id')
  @Roles('user')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req: any,
  ) {
    return this.invoiceService.update(+id, updateInvoiceDto, req.user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.invoiceService.remove(+id);
  // }
}
