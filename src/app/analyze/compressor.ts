function ensureCompressionStream() {
  if (!globalThis.CompressionStream || !globalThis.DecompressionStream) {
    console.log('CompressionStream not supported. Loading polyfill.');
    return import('./streamPolyfill');
  }
  return Promise.resolve();
}

export async function streamCompress(input: string): Promise<string> {
  await ensureCompressionStream();
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  const byteArray = new TextEncoder().encode(input);
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  return new Response(cs.readable).blob().then(blobToBase64);
}

export async function streamDecompress(input: string): Promise<string> {
  await ensureCompressionStream();
  const bytes = Uint8Array.from(atob(input), c => c.charCodeAt(0));
  const cs = new DecompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
    return new TextDecoder().decode(arrayBuffer);
  });
}

export async function compress(input: string): Promise<string> {
  const result = await streamCompress(input);
  return result.replace(/\+/g, '-').replace(/\//g, '_');
}

export async function decompress(input: string): Promise<string> {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  return await streamDecompress(input);
}
