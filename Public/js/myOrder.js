/**
 * 点击不同状态的tab订单状态来显示对于的订单列表
 */
var changeTab = function(){
		$(this).siblings().removeClass('on')
        $(this).addClass('on');
        var num = $(this).parent().children('li').index(this);
        var con_num = $(this).parents('.tabBox').find('.con').eq(num);
        var idName = con_num.find("ul").attr("id");
        getOrderList((num+1),idName);
        con_num.show();
        con_num.siblings('.con').hide()
	}

/**
 * 为切换tab绑定点击事件
 */
$(".item-cont").on("click",changeTab);

/**
 * 
 * @param type 要查询的订单类型
 * @param idName 要更新显示的dom元素id名称
 */
function getOrderList(type,idName){
	$.ajax({
		type:'post',
		url:ctx+"/tonys/order/getTypeOrder?ajax=true",
		data:{"listtype":type},
		success:function(result){
			if(result!=null && $.trim(result.error)==''){
				// 先清空，在追加
				$("#"+idName).empty();
				var content = [];
				if(result.orders.length==0){
					content[0] = "<div class=\"empty\" data-describe=\"没有找到商品信息\">"+
					                    "<div class=\"pic\">"+
					                    "<i class=\"pic_icon pi_classify\"></i>"+
					                "</div>"+
					                "<div class=\"txt\">"+
					                    "<p>您最近没有购买过商品 !</p>"+
					                "</div>"+
					            "</div>";
				}else{
					$.each(result.orders,function(index,item){
						content[index] = "<li class=\"card-item\" value=\""+item.ordercode+"\">"+
						                    "<div class=\"product-list list-row\">"+
						                        "<div class=\"p-itemrow\">"+
						                            "<div class=\"p-hd\">"+
						                                "<div class=\"p-hd-l\">订单号:"+item.ordercode+"</div>"+
						                                "<div class=\"p-hd-r\">"+item.statusname+"</div>"+
						                            "</div>";
						if(item.items!=null && item.items.length!=0){
							if(item.items.length>1){
								// 多类产品显示
								content[index] += "<a class=\"p-item jump order-item multi\"  href=\""+ctx+"/tonys/order/toOrderDetail?ordercode="+item.ordercode+"&listType="+type+"\" data-note=\"单类产品\">";
								content[index] += "<div class=\"p-img\">";
								$.each(item.items,function(idx,product){
									// 只显示4张图片
									if(idx<4){
										content[index]+= "<img src=\""+product.image+"\" alt=\"\">";
									}
								});
								content[index]+="</div>"+
												"<div class=\"p-cont\">"+
					                            "<div class=\"ptit\">"+
					                                "<ul>"+
					                                    "<li class=\"atit\">下单时间:"+item.createtime+"</li>"+
					                                "</ul>"+
					                            "</div>"+
					                        "</div>"+
					                        "</a>";
							}else{
								// 单类产显示
								var product = item.items[0];
								content[index] += "<a class=\"p-item jump order-item\"  href=\""+ctx+"/tonys/order/toOrderDetail?ordercode="+item.ordercode+"&listType="+type+"\" data-note=\"单类产品\">"+
													"<div class=\"p-img\"><img src=\""+product.image+"\" alt=\"\"></div>"+
													"<div class=\"p-cont\">"+
														"<div class=\"ptit\">"+
															"<ul>"+
																"<li class=\"mtit\">"+product.itemname+"</li>"+
																"<li class=\"atit\">下单时间:"+item.createtime+"</li>"+
															"</ul>"+
														"</div>"+
													"</div>"+
												"</a>";
							}
						}
	                    content[index] += "<div class=\"p-ft\">"+
						                        "<div class=\"p-ft-l red\"><u>¥"+item.amountpayable+"</u></div>";
						                        // 三张颜色状态 a-color橙色 t-color绿色 a-txt灰色,这里还需要判断支付方式是否为网上支付，是才显示在线支付的按钮
						                        if(type=='1'){
						                        	// 判断是在线支付的才显示在线支付
						                        	if(item.statusid=='3'){
						                        		content[index]+="<div class=\"p-ft-r a-color\"><button class=\"btn-pay\">" + item.paymentmethod + "</button></div>";
						                        	}
						                        }
						                        content[index]+="</div>"+
						                "</div>"+
						            "</div>"+
						        "</li>";
						
					});
				}
				$("#"+idName).append(content.join(" "));
				echo.init({offset: 100,throttle: 250});
                echo.render();
			}
		}
	});
}

/**
 * 去支付
 */
var goToPay = function(){
	$(this).off('click');
	// 获取订单号，订单价格，商品名称
	var orderCode = $(this).parent().parent().parent().parent().parent().attr("value");
	//var orderPrice = $(this).parent().prev().find('u').text().substring(1);
	$.ajax({
		type:'post',
		url:ctx+'/weixin/pay/payOrder?ajax=true',
		data:{"orderCode":orderCode,"flag":2}, 	// flag 为2，表示未付款订单的再次支付
		success:function(data){
			if(data.msgCode=="0"){
            	WeixinJSBridge.invoke(
            		'getBrandWCPayRequest',
            		{"appId" : data.appId,"timeStamp" : data.timeStamp, "nonceStr" : data.nonceStr, "package" : data.packageValue,"signType" : "SHA1", "paySign" : data.paySign },
            		function(res){
						WeixinJSBridge.log(res.err_msg);
						//alert(res.err_code + res.err_desc + res.err_msg);
						// 判断支付结果的情况
						if(res.err_msg=='get_brand_wcpay_request:ok'){
							alert("已成功支付");
							window.location.href = ctx+"/tonys/order/list?listtype=4";
						}else if(res.err_msg=='get_brand_wcpay_request:cancel'){
							alert("已取消支付");
							window.location.href = ctx+"/tonys/order/list?listtype=1";
						}else if(res.err_msg=='get_brand_wcpay_request:fail'){
							alert("支付失败,请稍后再试");
							$(this).on('click',goToPay);
						}
					});
            }else{	//订单创建失败
            	
            }
		}
	});
}

// 为待付款状态订单绑定付款动作
//$("#obligationList").on('click','.btn-pay',goToPay);

var choosePayment = function(){
	// 获取订单号，订单价格，商品名称
	var orderCode = $(this).parent().parent().parent().parent().parent().attr("value");
	window.location.href = ctx+"/tonys/order/createOrderSuccess?orderCode="+orderCode;
}


$("#obligationList").on('click','.btn-pay',choosePayment);


$(function(){
	// 初始加载待付款的订单
	var initListType = $("#listType").attr("value");
	var targetUpdateList = null;
	if(initListType=='1'){
		targetUpdateList = "obligationList";
	}else if(initListType=='2'){
		targetUpdateList = "shippedList";
	}else if(initListType=='3'){
		targetUpdateList = "cancelList";
	}else if(initListType=='4'){
		targetUpdateList = "finishedList";
	}
	var currentTab = $(".item-cont").eq(parseInt(initListType,"10")-1);
	currentTab.click();
	//getOrderList(initListType,targetUpdateList);
});