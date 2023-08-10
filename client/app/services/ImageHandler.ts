let instance:ImageHandler;

// Singlton
class ImageHandler {
  constructor() {
    if (instance) {
      throw new Error("New instance cannot be created!");
    }

    instance = this;
  }

  toBase64 (file: File) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

}

// freeze to prevent modification from outside world
let ImageHandlerInstance = Object.freeze(new ImageHandler());

export default ImageHandlerInstance;