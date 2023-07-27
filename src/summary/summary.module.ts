import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summary } from './entities/summary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Summary])],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
