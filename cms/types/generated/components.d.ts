import type { Schema, Struct } from '@strapi/strapi';

export interface ArticleBlocksImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_article_blocks_image_blocks';
  info: {
    description: '';
    displayName: 'image-block';
  };
  attributes: {
    image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface ArticleBlocksTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_article_blocks_text_blocks';
  info: {
    description: '';
    displayName: 'text-block';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'article-blocks.image-block': ArticleBlocksImageBlock;
      'article-blocks.text-block': ArticleBlocksTextBlock;
    }
  }
}
