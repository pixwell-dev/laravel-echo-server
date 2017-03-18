let crypto = require('crypto');
var request = require('request');
import { Log } from './../log';

export class Webhook {

  protected private: string;
  protected payload: any;
  protected _headers: any[]
  private request: any;

  constructor(protected options) {
    this.private = options.privateKey;
    this.request = request;
  }


  fire (type): Promise<any> {
    this.payload = type.getPayload();
    let options = {
      url: this.authHost() + this.options.webhookEndpoint + type.endpoint,
      form: this.payload,
      headers: {},
      rejectUnauthorized: false
    };


    return this.serverRequest(options, this.payload).then(res => {
      if (this.options.devMode) {
          Log.info(`[${new Date().toLocaleTimeString()}] - webhook success authenticated for: ${options.form.channel_name}`);
        }
    }, error => {
      if (this.options.devMode) {
        Log.warning(`[${new Date().toLocaleTimeString()}] - Not success send webhook to ${options.form.channel_name}`);
      }
    });
  }

  /**
     * Send a request to the server.
     *
     * @param  {object} socket
     * @param  {object} options
     * @return {Promise<any>}
     */
    protected serverRequest(options: any, payload: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            options.headers = this.prepareHeaders(payload, options);
            let body = payload;

            this.request.post(options, (error, response, body, next) => {
                if (error) {
                    Log.error(error);

                    reject({ reason: 'Error sending authentication request.', status: 0 });
                } else if (response.statusCode !== 200) {
                    if (this.options.devMode) {
                        Log.error(response.body);
                    }

                    reject({ reason: 'Client can not be authenticated, got HTTP status ' + response.statusCode, status: response.statusCode });
                } else {

                    try {
                        body = JSON.parse(response.body);
                    } catch (e) {
                        body = response.body
                    }

                    resolve(body);
                }
            });
        });
    }

    /**
     * Prepare headers for request to app server.
     *
     * @param  {object} options
     * @return {any}
     */
    protected prepareHeaders(payload: any, options: any): any {
        options.headers['X-Requested-With'] = 'XMLHttpRequest';
        options.headers['X-Socket-Signature'] = this.hashPayload(payload);

        return options.headers;
    }

    hashPayload(payload) {
      return crypto.createHmac('sha256', this.private).update(JSON.stringify(payload)).digest('hex');
    }

    /**
     * Get the auth endpoint.
     *
     * @return {string}
     */
    protected authHost(): string {
        return (this.options.authHost) ?
            this.options.authHost : this.options.host;
    }
}
