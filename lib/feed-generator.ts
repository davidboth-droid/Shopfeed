import { create } from 'xmlbuilder2';
import { Product } from './types';

export const generateGoogleShoppingXml = (products: Product[], shopName: string, shopLink: string) => {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rss', { 
      'xmlns:g': 'http://base.google.com/ns/1.0',
      version: '2.0' 
    })
    .ele('channel')
      .ele('title').txt(shopName).up()
      .ele('link').txt(shopLink).up()
      .ele('description').txt(`Daily product feed for ${shopName}`).up();

  products.forEach(product => {
    const item = root.ele('item');
    item.ele('g:id').txt(product.id || String(Math.random()).slice(2, 10)).up();
    item.ele('title').txt(product.title).up();
    item.ele('description').txt(product.description || product.title).up();
    item.ele('link').txt(product.link).up();
    item.ele('g:image_link').txt(product.imageLink).up();
    item.ele('g:price').txt(product.price).up();
    item.ele('g:availability').txt(product.availability).up();
    item.ele('g:condition').txt(product.condition).up();
    
    if (product.brand) item.ele('g:brand').txt(product.brand).up();
    if (product.gtin) item.ele('g:gtin').txt(product.gtin).up();
    if (product.mpn) item.ele('g:mpn').txt(product.mpn).up();
    
    item.up();
  });

  return root.end({ prettyPrint: true });
};
