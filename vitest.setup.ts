/**
 * jsdom implements Blob/File but omits the async reader methods the browser
 * provides (arrayBuffer/text). fileConverters reads uploads through
 * `File.arrayBuffer()`, so polyfill them via jsdom's FileReader.
 */
const BlobProto = Blob.prototype as any;

if (typeof BlobProto.arrayBuffer !== 'function') {
  BlobProto.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

if (typeof BlobProto.text !== 'function') {
  BlobProto.text = function (this: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}
