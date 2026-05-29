/**

 * Version Configuration - Cache Busting System

 * Project: EOPeak Corporate Design

 * Author: Eng. Eslam Osama Saad

 */



const ASSET_VERSIONS = {

  CSS_VERSION: '1.0.7',

  MODAL_CSS_VERSION: '1.0.0',

  JS_VERSION: '1.0.7',

  VIDEO_HANDLER_VERSION: '2',

  IMAGE_VERSION: '1.0.0',

  APP_VERSION: '1.0.2'

};



if (typeof window !== 'undefined') {

  window.ASSET_VERSIONS = ASSET_VERSIONS;

}



if (typeof module !== 'undefined' && module.exports) {

  module.exports = ASSET_VERSIONS;

}


