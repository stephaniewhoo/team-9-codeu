class MyUploadAdapter {
  constructor(loader) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        this._initRequest(file, resolve, reject);
      }));
  }

  // Aborts the upload process.
  abort() {
    if (this.request) {
      this.request.abort();
    }
  }

  _initRequest(file, resolve, reject) {
    const request = this.request = new XMLHttpRequest();
    const myForm = document.getElementById('imgForm');
    const formData = this.formData = new FormData(myForm);

    formData.append('image', file);

    fetchBlobstoreUrl().then((imageUploadUrl) => {
      request.open("POST", imageUploadUrl);
      request.send(formData);
      const genericErrorText = `Couldn't upload file: ${file.name}.`;

      request.addEventListener('error', () => reject(genericErrorText));
      request.addEventListener('abort', () => reject());
      request.addEventListener('load', () => {
        fetch('/blobstore-handler')
          .then((response) => {
            return response.text();
          })
          .then((imageUrl) => {
            resolve({
              default: imageUrl,
            });
          });
      });
    });
  }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  }
}

function fetchBlobstoreUrl() {
  return fetch('/blobstore-upload-url')
    .then((response) => {
      return response.text();
    });
}