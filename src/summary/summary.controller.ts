import { Body, Controller, Get, Post } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post()
  generateSummary(@Body('summary') text: string) {
    return this.summaryService.generateSummary(text);
  }

  @Post('mailchimp')
  addMailChimpCampaign() {
    return this.summaryService.addMailChimpCampaign();
  }
}
