import { Database } from '@/types_db';


type Price = Database['public']['Tables']['prices']['Row'];

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const postData = async ({
  url,
  data,
  contentType = 'application/json'
}: {
  url: string;
  data?: any;
  contentType?: string;
}) => {
  console.log('posting,', url, data);

  const isJSON = contentType === 'application/json';

  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': contentType }),
    credentials: 'same-origin',
    body: isJSON ? JSON.stringify(data) : data
  });

  if (!res.ok) {
    console.log('Error in postData', { url, data, res });

    throw Error(res.statusText);
  }

  return res.json();
};