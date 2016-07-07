  $(".prolist-tab li").eq(0).addClass("on");
    $(".product-list div.con").hide().eq(0).show();
    $(".prolist-tab li").click(function(){
        $(this).addClass("on").siblings().removeClass("on");
        $(".product-list div.con").hide().eq($(this).index()).show().siblings().hide();
        var menuId=productListControl.getQueryString("menuid");
        if($(this).index()==0){productListControl.loadProductList(menuId,'0',defaultSortBy_start+1,defaultSortBy_start+scalar);}else if($(this).index()==1){
          productListControl.loadProductList(menuId,'1',newProductSortBy_start+1,newProductSortBy_start+scalar);}else{productListControl.loadProductList(menuId,'2',saleNumSortBy_start+1,saleNumSortBy_start+scalar);}     
    });
    $(document).scroll(function(event){
        $(".altmsg").css({"top":0,"position":"fixed","width":"100%","z-index":99});
        $(".prolist-tab").css({"top":0,"position":"fixed","width":"100%","z-index":99})
        $(".product-list").css("margin-top","50px");
    })  
/**
 * 默认参数
 */
var defaultSortBy_start=0;
var newProductSortBy_start=0;
var saleNumSortBy_start=0;
var scalar=8;
var productListControl={
    defaultObject:$('#defaultSortBy'),
    newProductObject:$('#newProductSortBy'),
    saleNumObject:$('#saleNumSortBy'),
    currentMenuId:function(){ return productListControl.getQueryString("menuid")!=null?productListControl.getQueryString("menuid"):0;},
    isOwnEmpty:function(obj){for(var name in obj){if(obj.hasOwnProperty(name)){return false; }} return true;},
    getQueryString: function(name){ var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");var r = window.location.search.substr(1).match(reg);if (r != null) return unescape(r[2]); return null;},
    getCurrentObject:function(sortby){if(sortby=='0'){return productListControl.defaultObject;}else if(sortby=='1'){return productListControl.newProductObject;}else{return productListControl.saleNumObject;}},
    loadProductList:function(menuid,sortby,startPage,endPage){
         productListControl.getCurrentObject(sortby).children(".load").remove();
         $.ajax({
                type:'post',
                url:ctx+'/product/getMoreProductInMenu?ajax=true',
                data:{"menuid":menuid,"sortby":sortby,"from":startPage,"to":endPage},
                success:function(data){
                   if(!productListControl.isOwnEmpty(data.shopitems)){
                        if(sortby=='0'){defaultSortBy_start +=scalar;}else if(sortby=='1'){newProductSortBy_start +=scalar;}else{saleNumSortBy_start +=scalar;}
                        var arr = [];
                        $.each(data.shopitems,function(index,item){
                            if(item.buytype=='cart'){// 显示添加进购物车的图标
                                arr[index]="<li><div class=\"p-item\"><a href=\""+ctx+"/product/toProductDetail?productId="+item.itemid+"\" class=\"p-img\"><img src=\""+ctx+"/static/images/logo_bg.png\" alt=\"Photo\" data-echo=\""+item.image+"\"></a><div class=\"p-cont\"><div class=\"ptit\"><div class=\"mtit\">"+item.name+"</div><div class=\"atit\">"+item.intro+"</div></div><div class=\"pinfo\"><div class=\"price\">￥"+item.price+"</div><div class=\"num addcart\" value=\""+item.itemid+"\"></div></div></div></div></li>";	                             
                            }else{// 显示立即订购图标
                                arr[index]="<li><div class=\"p-item\"><a href=\""+ctx+"/product/toProductDetail?productId="+item.itemid+"\" class=\"p-img\"><img src=\""+ctx+"/static/images/logo_bg.png\" alt=\"Photo\" data-echo=\""+item.image+"\"></a><div class=\"p-cont\"><div class=\"ptit\"><div class=\"mtit\">"+item.name+"</div><div class=\"atit\">"+item.intro+"</div></div><div class=\"pinfo\"><div class=\"price\">￥"+item.price+"</div><div class=\"num addorder\" value=\""+item.itemid+"\" data-note=\"立即订购\">立即订购</div></div></div></div></li>";	                             
                            }
                        });
                        productListControl.getCurrentObject(sortby).append(arr.join(" "));
                        productListControl.getCurrentObject(sortby).append("<li class=\"load\">点击加载更多...</li>");
//                        if(data.shopitems.length<7){
//                        }
                        echo.init({offset: 100,throttle: 250});
                        echo.render();
                    }else{
                    	// 判断当前tab下是否已加载过数据
                    	if(productListControl.getCurrentObject(sortby).children("li").length==0){
                    		productListControl.getCurrentObject(sortby).children(".load").remove();
//                    		productListControl.getCurrentObject(sortby).append("<li class=\"load\" style=\"margin-bottom:0px;\">暂无此类商品</li>"); 
                    		productListControl.getCurrentObject(sortby).append("<div class=\"empty\" data-describe=\"没有找到商品信息\">"+
                                "<div class=\"pic\">"+
                                    "<i class=\"pic_icon pi_classify\"></i>"+
                                "</div>"+
                                "<div class=\"txt\">"+
                                    "<p>暂无此类商品 !</p>"+
                                "</div>"+
                            "</div>"); 
                    	}else{	// 没有更多商品可以加载
                    		productListControl.getCurrentObject(sortby).children(".load").text("没有更多菜品");
                    		productListControl.getCurrentObject(sortby).off('click');
                    	}
                    }
                    
                }
            });
    }
}

$(document).ready(function(){
    var sortBy=productListControl.getQueryString("sortby");
    var menuId=productListControl.getQueryString("menuid");
    var sortBy_start;
    if(sortBy=='1'){sortBy_start=newProductSortBy_start;}else if(sortBy=='2'){sortBy_start=saleNumSortBy_start;}else{sortBy_start=defaultSortBy_start;}
    productListControl.loadProductList(menuId,sortBy,sortBy_start+1,sortBy_start+scalar);
});
// 由于三个tab页的内容都是动态生成的，所以需要分别未他们绑定点击的事件
$("#defaultSortBy").on('click','.load',function(){productListControl.loadProductList(productListControl.currentMenuId(),0,defaultSortBy_start+1,defaultSortBy_start+scalar);});
$("#newProductSortBy").on('click','.load',function(){productListControl.loadProductList(productListControl.currentMenuId(),1,newProductSortBy_start+1,newProductSortBy_start+scalar);});
$("#saleNumSortBy").on('click','.load',function(){productListControl.loadProductList(productListControl.currentMenuId(),2,saleNumSortBy_start+1,saleNumSortBy_start+scalar);});
        //购物车添加成功提示信息
    function addCart(){
        var productId = $(this).attr("value");
        doAddToCart(productId,1);
        event.preventDefault();//阻止a标签href事件
    }
    
    function showAddResult(obj){
        if($('.altmsg').attr('name')=='off'){
                $('.altmsg').attr('name','on').removeClass('altmsg-anima-off').addClass('altmsg-anima');
                setTimeout(function() {
                    $('.altmsg').removeClass('altmsg-anima').addClass('altmsg-anima-off').attr('name','off');
                }, 1000);
            }else{
                $('.altmsg').attr('name','off').removeClass('altmsg-anima');
            }
    }
    
    // 向服务器发送添加商品购物车的请求
    function doAddToCart(productId,productNum){
        $.ajax({
                type:'post',
                url:ctx+'/myCart/addCart?ajax=true',
                data:{"productId":productId,"productNum":productNum},
                success:function(result){
                        if(result.error==''){	// 表示添加成功
                        		// 修改购物车商品数量
                        		$("#cartCount").html(result.itemtotalcnt);
                                showAddResult();
                        }else{
                                //alert("添加购物车失败");
                        }
                }
        });
    }

    // 分别为三个tab页绑定添加进购物车事件
    $('#defaultSortBy').on('click','.addcart',addCart);
    $('#newProductSortBy').on('click','.addcart',addCart);
    $('#saleNumSortBy').on('click','.addcart',addCart);
    
    var addOrder = function(){
        var productId = $(this).attr("value");
        var url = ctx+"/tonys/order/toPackageOrderConfirm?productId="+productId+"&productNum=1";
        window.location.href=url;
        event.preventDefault();//阻止a标签href事件
    }
    
        // 分别为三个tab页绑定立即订购按钮操作事件
    $('#defaultSortBy').on('click','.addorder',addOrder);
    $('#newProductSortBy').on('click','.addorder',addOrder);
    $('#saleNumSortBy').on('click','.addorder',addOrder);
    

