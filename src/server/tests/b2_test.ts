import 'https://deno.land/std@0.177.0/dotenv/load.ts';

import { BackblazeClient } from '../b2.ts';
import { getVideoDownloadFilename } from '../utils.ts';

const B2_ENABLED = Deno.env.get('B2_ENABLED')!.toLowerCase() === 'true';
const B2_BUCKET_ID = Deno.env.get('B2_BUCKET_ID')!;

if (!B2_ENABLED) {
  console.log('Connection to b2 disabled. Skipped test.');
  Deno.exit(0);
}

const b2 = new BackblazeClient({ userAgent: Deno.env.get('USER_AGENT')! });

await b2.authorizeAccount({
  accountId: Deno.env.get('B2_KEY_ID')!,
  applicationKey: Deno.env.get('B2_APP_KEY')!,
});

console.log('Connected to b2');

const fileName = crypto.randomUUID();
const fileContents = await Deno.readFile('./tests/videos/test.mp4');

const video = {
  title: 'test".dem',
  file_name: 'test".dem',
};

const upload = await b2.uploadFile({
  bucketId: B2_BUCKET_ID,
  fileName,
  fileContents,
  contentType: 'video/mp4',
  contentDisposition: `attachment; filename="${encodeURIComponent(getVideoDownloadFilename(video))}"`,
});

const videoUrl = b2.getDownloadUrl(upload.fileName);

console.log({ videoUrl });
