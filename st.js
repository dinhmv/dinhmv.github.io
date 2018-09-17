(function() {
  "use strict";
  var app = null;
  window.addEventListener('message', function(event) {
    if(event.source !== window) return;
    if(event.data && event.data.type && event.data.type == 'convertBase64Img_done') {
      insertImage(event.data.base64);
    }
  })
  function onElementReady(element, callback) {
    var i = 0;
    var interval = setInterval(function() {
      if(document.querySelector(element)) {
        if (!!window.Ember) {
          app = Ember.Namespace.NAMESPACES_BY_ID.seller;
        }
        callback(app);
        clearInterval(interval);
      }
      if(i > 300) clearInterval(interval);
      i++;
    }, 100);
  }
  function insertImage(base64) {
    var imageManagerNode = document.querySelector('.image-manager');
    if(imageManagerNode && base64 && app) {
      var listImg = app.__container__.lookup('-view-registry:main')[imageManagerNode.id];
      listImg.itemCollection.addObject(base64);
    }
  }
  function getSold(url, node) {
    var matches = /i\.([0-9]+)\.([0-9]+)$/g.exec(url);
    if(matches) {
      var productid = matches[2];
      var shopid = matches[1];
      var xhr = new XMLHttpRequest();
      xhr.open("GET", 'https://shopee.vn/api/v1/item_detail/?item_id='+productid+'&shop_id='+shopid, true);
      xhr.setRequestHeader('if-none-match-','55b03-fe251123ce91f8bc0a740196f692e5e7');
      xhr.onload = function () {
        if(xhr.readyState == 4 && xhr.status == '200') {
          var response = JSON.parse(xhr.responseText);
          var html = '<div class="shopee-item-card__btn-likes" style="margin-right: 5px; color: #ff5722;"><svg class="shopee-svg-icon icon-like-2" viewBox="0 0 26.6 25.6"><polyline fill="none" points="2 1.7 5.5 1.7 9.6 18.3 21.2 18.3 24.6 6.1 7 6.1" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2.5"></polyline><circle cx="10.7" cy="23" r="2.2" stroke="none"></circle><circle cx="19.7" cy="23" r="2.2" stroke="none"></circle></svg><div class="shopee-item-card__btn-like__text" style="margin-left: 2px;">'+response.sold+' </div></div>';
          if(node && node.querySelector('.shopee-item-card__section-actions')) {
            node.querySelector('.shopee-item-card__section-actions').innerHTML = html + node.querySelector('.shopee-item-card__section-actions').innerHTML;
            var imgNode = node.querySelector('.animated-lazy-image');
            if(imgNode) {
              //imgNode.innerHTML += '<div class="shopee-item-card__date" style="left: 1rem;color: #ff5722;position: absolute;bottom: 1rem;padding: .2rem .4rem;border-radius: 2px;background: rgba(255, 255, 255, 0.33);font-size: 1.2rem;">'+ new Date(response.ctime * 1000).toLocaleDateString('vi-VN')+'</div>';
            }
          }
        }
      }
      xhr.send();
    }
  }
  //front end
  if(/https?:\/\/shopee.vn/g.test(window.location.href)) {
    onElementReady('.shopee-product-info-body__order-block',function() {
      var productNode = document.querySelector('.product-page');
      var matches = /i\.([0-9]+)\.([0-9]+)$/g.exec(window.location.href);
      if(productNode && matches) {
        //product single
        var productid = matches[2];
        var shopid = matches[1];
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://shopee.vn/api/v1/item_detail/?item_id='+productid+'&shop_id='+shopid, true); 
        xhr.setRequestHeader('if-none-match-','55b03-fe251123ce91f8bc0a740196f692e5e7]');
        xhr.onload = function () {
          if(xhr.readyState == 4 && xhr.status == '200') {
            var data = JSON.parse(xhr.responseText);
            var variationNode = document.querySelectorAll('.product-variation');
            if(data.models && variationNode.length) {
              for(var i = 0; i < data.models.length; i++) {
                if(variationNode[i]) {
                  variationNode[i].innerHTML += '/<span style="color: #ff5722;">'+data.models[i].sold+' sold</span>';
                }
              }
            } else if(document.querySelector('.shopee-product-info-body__order-quantity__stock-count')) {
              var stockNode = document.querySelector('.shopee-product-info-body__order-quantity__stock-count');
              stockNode.innerHTML += '/<span style="color: #ff5722;">'+data.sold+' sold</span>';
            }
          }
        } 
        xhr.send();
      }
    });
    //
    onElementReady('.shopee-search-item-result, .image-carousel__item-list', function(app) {
      var target = document.querySelector('.shopee-search-item-result, .image-carousel__item-list');
      function getSoldLoop(productNode, i) {
        setTimeout(function(){
          var node = productNode[i];
          if(node) {
            getSold(node.href, node);
          }
          if(i < productNode.length) getSoldLoop(productNode, ++i);
        }, 100);
      }
      var productNode = document.querySelectorAll('a.shopee-item-card--link:not(.sold-added)');
      productNode.forEach(function(node) { node.classList.add('sold-added'); });
      getSoldLoop(productNode, 0);

      var observer = new MutationObserver(function(mutations) {
        productNode = document.querySelectorAll('a.shopee-item-card--link:not(.sold-added)');
        productNode.forEach(function(node) { node.classList.add('sold-added'); });
        getSoldLoop(productNode, 0); 
      });

      var config = {subtree: true, attributes: true};
      observer.observe(target, config);
    });
  }
  onElementReady('#shopee-chat-embedded', function() {
    var chatNode = document.querySelector('#shopee-chat-embedded');
    chatNode.onclick = function(e) {
      if(this.querySelector('textarea.ember-text-area:not(added-check)')) {
        var textareaNode = this.querySelector('textarea.ember-text-area:not(added-check)');
        textareaNode.classList.add('added-check');
        textareaNode.onkeyup = function(e) {
          this.value = this.value.replace(/(facebook|fb|zalo|zl|instagram|insta|tiki|lazada|adayroi|lotte|sendo|đặt cọc|dat coc|chuyển khoản|chuyen khoan|ck|ship ngoài|giao ngoài)\s+/gim, '*** ');
        }
      }
    }
  })
  //product detail
  if(/banhang.shopee.vn\/portal\/product\/[0-9]+/g.test(window.location.href)) {
    onElementReady('.image-manager', function(app) {
      var editPageNode = document.querySelector('#editPage');
      var imageManagerNode = document.querySelector('.image-manager');
      var imgUrlNode = document.createElement('div'); imgUrlNode.id = 'inputImg';
      imgUrlNode.innerHTML = `<div class="grid edit-row">
      <div class="col-8" style="margin-right: 6px;">
      <input type="text" placeholder="Nhập đường dẫn ảnh" style="background: #fdfdfd;border: 1px solid rgba(0,0,0,.14);border-radius: 2px;box-shadow: 2px 2px 2px rgba(0,0,0,.02);height: 40px;width: 100%;padding: 0 10px;">
      </div>
      <div class="col-4">
      <div id="uploadImg" class="shopee-button shopee-button--primary shopee-button--xl--width">Tải lên</div>
      </div>
      </div>
      <div class="header-description" style="margin-top: 16px;">Shopee Tools giúp bạn tải ảnh nhanh hơn bằng cách nhập đường dẫn URL ảnh</div>`;
      if(!document.querySelector('#inputImg')) {
        editPageNode.insertBefore(imgUrlNode, imageManagerNode);
      }
      imgUrlNode.querySelector('#uploadImg').onclick = function(e) {
        window.postMessage({
          type: 'convertBase64Img',
          url: imgUrlNode.querySelector('input').value
        }, '*');
        imgUrlNode.querySelector('input').value = '';
      }
    })
  }
  //copy product
  if(/banhang.shopee.vn\/portal\/product\/list/g.test(window.location.href)) {
    onElementReady('.product-item', function(app) {
      if (app) {
        var target = document.querySelector('.portal-panel>.liquid-container');
        if(target) {
          var observer = new MutationObserver(function(mutations) {
            var node = target.querySelector('.portal-panel__action__actions:not(.cp-added)');
            if(node) {
              node.className += ' cp-added';
              node.innerHTML += '<div id="copyProduct" class="shopee-button shopee-button--primary shopee-button--xl--width">Sao chép</div>'; 
              document.querySelector('#copyProduct:not(.shopee-button--disabled)').onclick = function(e) {
                copyProduct(app, e);
              }
              return;
            }

          });

          var config = {childList: true};
          observer.observe(target, config);
        }
        
      }
    });
  }
  function copyProduct(app, e) {
    var products = [];
    var selectedNode = document.querySelectorAll('.shopee-checkbox.selected');
    if (confirm('Bạn có muốn sao chép ' + selectedNode.length +' sản phẩm không?')) {
      e.target.textContent = 'Đang sao chép';
      e.target.classList.add('shopee-button--disabled');
      var token = document.cookie.replace(/.*SPC_CDS=(.*?);.*/g,'$1');
      for(var i = 0; i < selectedNode.length; i++) {
        var parentNode = selectedNode[i].parentNode?selectedNode[i].parentNode.closest('.product-item'):null;
        if(parentNode) {
          var component = app.__container__.lookup('-view-registry:main')[parentNode.id];
          if(component) {
            var product_json = component.product.toJSON();

            product_json['logistics_channel'] = [{"channelid":50012,"enabled":1},{"channelid":50011,"enabled":1},{"channelid":50010,"enabled":1},{"channelid":50015,"enabled":1},{"channelid":50016,"enabled":1}];
            var itemmodels = component.product.get('itemmodels');
            var subcategories = component.product.get('subcategories');
            if(itemmodels) { 
              product_json['itemmodels'] = itemmodels.map(function(i) {
                var item = i.toJSON();
                return {name: item.name, sku: item.sku + '-ST', stock: 0, price: item.price};
              })
            }
            
            if(subcategories) { 
              product_json['subcategories'] = subcategories.map(function(i) {
                return i.toJSON();
              })
            }
            products.push(product_json);
          }
        }
      }
      createProduct(products, token, e);
      console.log(products);
    }
  }
  function createProduct(products, token, e) {
    if(products.length) {
      var product = products[0];
      products.splice(0, 1);
      //thay doi ten san pham
      var time = Math.floor(Date.now() / 1000);
      var product_name = product.name;
      product.name = '[Sao chép '+time+'] '+ product_name;
      product.stock = 0;
      product.parent_sku = product.parent_sku+'-ST';
      product.price_before_discount = null;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", 'https://banhang.shopee.vn/api/v2/products/?SPC_CDS='+token+'&SPC_CDS_VER=2', true);
      xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
      xhr.onload = function () {
        if(xhr.readyState == 4 && xhr.status == '200') {
          var response = JSON.parse(xhr.responseText);
          if(response.errcode || response.err_message || response.error) {
            flashMsg('Sao chép thất bại sản phẩm ' + product_name, 0);
            console.log('Có lỗi xảy ra: '+ product_name);
            console.log(response);
          } else {
            flashMsg('Sao chép thành công sản phẩm ' + product_name, 1);
            console.log('Sao chép thành công sản phẩm '+product_name);
          }
        }
        createProduct(products, token, e);
      };
      xhr.send(JSON.stringify({"product": product}));
    } else {
      //neu tao xong thi thong bao va reload
      e.target.textContent = 'Sao chép';
      e.target.classList.remove('shopee-button--disabled');

      setTimeout(function(){
        window.location.reload();
      }, 1000);
    }
  }
  function flashMsg(msg, success) {
    var alert = document.querySelector('.shopee-toast');
    if(alert) {
      var classStatus = success?'success':'error';
      alert.innerHTML = '<div class="alert-box '+classStatus+' active ember-view">'+msg+'</div>';
      setTimeout(function(){
        alert.innerHTML = '';
      }, 1500);
    }
  }
}());
