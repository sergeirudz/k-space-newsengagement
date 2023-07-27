import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

import * as MOCKED_SLACK from './messages.json';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Summary } from './entities/summary.entity';
import {
  MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER_PREFIX,
  OPENAI_API_KEY,
} from 'src/config/config';

import mailchimp from '@mailchimp/mailchimp_marketing';
import axios from 'axios';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
  ) {}

  async generateSummary(text: string) {
    const lastDays = 1;

    const currentTime = Date.now() / 1000; // Convert current time to seconds (Unix Epoch time)

    const filteredMessages = MOCKED_SLACK.filter((message) => {
      const messageTimestamp = parseFloat(message.ts);
      const differenceInDays =
        (currentTime - messageTimestamp) / (24 * 60 * 60);

      return differenceInDays <= lastDays;
    });

    const trimmedMessageJson = filteredMessages.map((message) => {
      const replies = message.replies.map((reply) => {
        return reply.text;
      });

      return {
        message: message.text,
        replies: replies,
      };
    });

    const summaries = [];

    try {
      for (const obj of trimmedMessageJson) {
        const summaryResponse = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content:
                'Please generate me a one sentence summary from the following text.',
            },
            { role: 'user', content: JSON.stringify(obj) },
          ],
        });
        summaries.push(summaryResponse.data.choices[0].message.content);
      }
      return this.summaryRepository.save({ summaries: summaries });
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  async addMailChimpCampaign() {
    const response = await makeMailchimpRequest('campaigns', 'GET', {
      type: 'plaintext',
    });
    console.log(response);
    return response;
  }
}

async function makeMailchimpRequest(endpoint, method = 'GET', data) {
  try {
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/${endpoint}}`;
    const headers = {
      Authorization: `apikey ${MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const options = {
      method,
      url,
      headers,
      data,
    };

    const response = await axios(options);
    return response.data;
  } catch (error) {
    throw new Error('Mailchimp API request failed.');
  }
}
