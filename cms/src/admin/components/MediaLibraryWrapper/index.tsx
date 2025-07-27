import React from 'react';

interface UploadFile {
  id: number;
  name: string;
  url: string;
  formats?: {
    thumbnail?: {
      url: string;
    };
  };
  previewURL?: string;
}

interface Props {
  onChange: (files: UploadFile[]) => void;
  [key: string]: any;
}

const MediaLibraryWrapper: React.FC<Props> = ({ onChange, ...rest }) => {
  const handleChange = (files: UploadFile[]) => {
    const updatedFiles = files.map((file) => {
      const thumbnail = file.formats?.thumbnail?.url;
      return thumbnail
        ? {
            ...file,
            previewURL: thumbnail, // this is key for the admin panel preview
          }
        : file;
    });

    onChange(updatedFiles);
  };

  // For now, return a simple div since MediaLibraryDialog isn't available
  return <div {...rest} onClick={() => handleChange([])}>Media Library Wrapper</div>;
};

export default MediaLibraryWrapper;
