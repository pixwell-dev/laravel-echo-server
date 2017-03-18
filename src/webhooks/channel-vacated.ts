import { Webhook } from './webhook';


export class ChannelVacated {

  private event = 'channel_vacated';
  private payload;
  public endpoint = 'channel-existence'

  constructor(private channel:string) {
    this.channel = channel;
    this.payload = { name: this.event, channel: this.channel };
  }

  getPayload() {
    return this.payload;
  }

  getChannel() {
    return this.channel;
  }

  getEvent() {
    return this.event;
  }
}
