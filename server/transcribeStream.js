const {
    TranscribeStreamingClient,
    StartStreamTranscriptionCommand
  } = require('@aws-sdk/client-transcribe-streaming');
  const { PassThrough } = require('stream');
  
  const REGION       = process.env.AWS_REGION       || 'us-east-1';
  const SAMPLE_RATE  = process.env.AUDIO_SAMPLE_HZ  || 16000;
  const LANGUAGE     = process.env.AUDIO_LANGUAGE   || 'en-US';
  
  // single, reusable client
  const transcribeClient = new TranscribeStreamingClient({ region: REGION });
  
  /**
   * Starts an audio stream to Amazon Transcribe and immediately returns
   * the `PassThrough` you can write PCM chunks into.
   *
   * @param {(res:{text:string,isFinal:boolean}) => void} onTranscription
   *        Callback invoked for *every* transcript (partial & final).
   * @param {string} [language] Optional language code to override default
   * @returns {PassThrough & {stop():void}}
   */
  function startTranscriptionStream(onTranscription, language) {
    const audioStream = new PassThrough();
  
    audioStream.stop = () => audioStream.end();
  
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: language || LANGUAGE,
      MediaEncoding:          'pcm',
      MediaSampleRateHertz:   SAMPLE_RATE,
      AudioStream: (async function* () {
        for await (const chunk of audioStream) {
          yield { AudioEvent: { AudioChunk: chunk } };
        }
        // graceful EOF – empty audio frame
        yield { AudioEvent: { AudioChunk: Buffer.alloc(0) } };
      })()
    });

    (async () => {
      try {
        const response = await transcribeClient.send(command);
  
        for await (const event of response.TranscriptResultStream) {
          const res = event.TranscriptEvent?.Transcript?.Results?.[0];
          if (!res || !res.Alternatives?.length) continue;
  
          onTranscription({
            text:     res.Alternatives[0].Transcript,
            isFinal: !res.IsPartial
          });
        }
      } catch (err) {
        if (
          err.name === 'BadRequestException' &&
          err.message?.includes('no new audio was received')
        ) {
          console.warn('AWS Transcribe stream closed due to inactivity.');
        } else {
          console.error('Error from Transcribe stream:', err);
        }
      }
    })();
  
    return audioStream; // ready for writes immediately
  }
  
  module.exports = { startTranscriptionStream };
  