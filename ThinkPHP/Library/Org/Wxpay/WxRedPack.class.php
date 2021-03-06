<?php
/**
 * Author: huanglele
 * Date: 2016/4/4
 * Time: 下午 07:31
 * Description:
 */

namespace Org\Wxpay;

include_once 'WxPay.Exception.php';

class WxRedPack
{

    protected $values = array();


    public function __construct(){
        $this->values['nonce_str'] = $this->getNonceStr(32);
    }

    /**
     * 发送一个红包
     * @param $data 需要的参数数组
     * @return array 执行的结果集
     * @throws WxPayException
     */
    public function send($data){
        $this->values['total_num'] = 1;     //红包发放总人数
        $this->values['wishing'] = '红包祝福语';     //红包发放总人数
        $this->values['client_ip'] = '给您派红包了';     //调用接口的机器Ip地址
        $this->values['act_name'] = '活动名称';     //活动名称
        $this->values['remark'] = '猜越多得越多，快来抢！';     //备注信息
        $this->values['client_ip'] = $_SERVER['REMOTE_ADDR'];     //调用接口的机器Ip地址
        if(is_array($data)){
            foreach($data as $k=>$v){
                $this->values[$k] = $v;
            }
        }
        $this->SetSign();
        $xml = $this->ToXml();
        $url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';
        $response = $this->postXmlCurl($xml,$url,true);

        $result = WxRedPackResults::Init($response);
        return $result;
    }

    /**
     * 查询一个微信红包状态
     * @param $mch_billno 商户发放红包的商户订单号
     * @return array 执行结果集
     * @throws WxPayException
     */
    public function query($mch_billno){
        $this->values['mch_billno'] = $mch_billno;
        $this->values['mch_id'] = C('Wx.mch_id');
        $this->values['appid'] = C('Wx.AppID');
        $this->values['bill_type'] = 'MCHT';
        $this->SetSign();
        $xml = $this->ToXml();
        $url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo';
        $response = $this->postXmlCurl($xml,$url,true);

        $result = WxRedPackResults::Init($response);
        return $result;
    }

    /**
     * 设置备注信息
     * @param string $value
     **/
    public function SetRemark($value)
    {
        $this->values['remark'] = $value;
    }

    /**
     * 设置活动名称
     * @param string $value
     **/
    public function SetAct_name($value)
    {
        $this->values['act_name'] = $value;
    }


    /**
     * 设置红包祝福语
     * @param string $value
     **/
    public function SetWishing($value)
    {
        $this->values['wishing'] = $value;
    }

    /**
     * 设置微信支付分配的商户号
     * @param string $value
     **/
    public function SetMch_id($value)
    {
        $this->values['mch_id'] = $value;
    }

    /**
     * 设置微信分配的公众账号ID
     * @param string $value
     **/
    public function SetAppid($value)
    {
        $this->values['wxappid'] = $value;
    }

    /**
     * 设置接受红包的用户用户在wxappid下的openid
     */
    public function SetOpenid($value){
        $this->values['re_openid'] = $value;
    }

    /**
     * 设置订单总金额，只能为整数，详见支付金额
     * @param string $value
     **/
    public function SetTotal_amount($value)
    {
        $this->values['total_amount'] = $value;
    }

    /**
     * String(28)
     * 设置商户订单号（每个订单号必须唯一）组成：mch_id+yyyymmdd+10位一天内不能重复的数字。
     */
    public function SetMch_billno($value){
        $this->values['mch_billno'] = $value;
    }


    /**
     * 设置签名，详见签名生成算法
     * @param string $value
     **/
    public function SetSign()
    {
        $sign = $this->MakeSign();
        $this->values['sign'] = $sign;
        return $sign;
    }

    /**
     * 生成签名
     * @return 签名，本函数不覆盖sign成员变量，如要设置签名需要调用SetSign方法赋值
     */
    public function MakeSign()
    {
        //签名步骤一：按字典序排序参数
        ksort($this->values);
        $string = $this->ToUrlParams();
        //签名步骤二：在string后加入KEY
        $string = $string . "&key=".C('Wx.key');
        //签名步骤三：MD5加密
        $string = md5($string);
        //签名步骤四：所有字符转为大写
        $result = strtoupper($string);
        return $result;
    }

    /**
     * 获取签名，详见签名生成算法的值
     * @return 值
     **/
    public function GetSign()
    {
        return $this->values['sign'];
    }

    /**
     * 判断签名，详见签名生成算法是否存在
     * @return true 或 false
     **/
    public function IsSignSet()
    {
        return array_key_exists('sign', $this->values);
    }

    /**
     * 输出xml字符
     * @throws WxPayException
     **/
    public function ToXml()
    {
        if(!is_array($this->values)
            || count($this->values) <= 0)
        {
            throw new WxPayException("数组数据异常！");
        }

        $xml = "<xml>";
        foreach ($this->values as $key=>$val)
        {
            if (is_numeric($val)){
                $xml.="<".$key.">".$val."</".$key.">";
            }else{
                $xml.="<".$key."><![CDATA[".$val."]]></".$key.">";
            }
        }
        $xml.="</xml>";
        return $xml;
    }

    /**
     * 将xml转为array
     * @param string $xml
     * @throws WxPayException
     */
    public function FromXml($xml)
    {
        if(!$xml){
            throw new WxPayException("xml数据异常！");
        }
        //将XML转为array
        //禁止引用外部xml实体
        libxml_disable_entity_loader(true);
        $this->values = json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);
        return $this->values;
    }

    /**
     * 格式化参数格式化成url参数
     */
    public function ToUrlParams()
    {
        $buff = "";
        foreach ($this->values as $k => $v)
        {
            if($k != "sign" && $v != "" && !is_array($v)){
                $buff .= $k . "=" . $v . "&";
            }
        }

        $buff = trim($buff, "&");
        return $buff;
    }

    /**
     *
     * 产生随机字符串，不长于32位
     * @param int $length
     * @return 产生的随机字符串
     */
    public static function getNonceStr($length = 32)
    {
        $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        $str ="";
        for ( $i = 0; $i < $length; $i++ )  {
            $str .= substr($chars, mt_rand(0, strlen($chars)-1), 1);
        }
        return $str;
    }

    /**
     * 以post方式提交xml到对应的接口url
     *
     * @param string $xml  需要post的xml数据
     * @param string $url  url
     * @param bool $useCert 是否需要证书，默认不需要
     * @param int $second   url执行超时时间，默认30s
     * @throws WxPayException
     */
    private function postXmlCurl($xml, $url, $useCert = false, $second = 30)
    {
        $ch = curl_init();
        //设置超时
        curl_setopt($ch, CURLOPT_TIMEOUT, $second);

        //如果有配置代理这里就设置代理
        if(C('Wx.CURL_PROXY_HOST') != "0.0.0.0"
            && C('Wx.CURL_PROXY_PORT') != 0){
            curl_setopt($ch,CURLOPT_PROXY, C('Wx.CURL_PROXY_HOST'));
            curl_setopt($ch,CURLOPT_PROXYPORT, C('Wx.CURL_PROXY_PORT'));
        }
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
        curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,false);//严格校验
        //设置header
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        //要求结果为字符串且输出到屏幕上
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

        if($useCert == true){
            //设置证书
            //使用证书：cert 与 key 分别属于两个.pem文件
            curl_setopt($ch,CURLOPT_SSLCERTTYPE,'PEM');
            curl_setopt($ch,CURLOPT_SSLCERT, C('Wx.SSLCERT_PATH'));
            curl_setopt($ch,CURLOPT_SSLKEYTYPE,'PEM');
            curl_setopt($ch,CURLOPT_SSLKEY, C('Wx.SSLKEY_PATH'));
        }
        //post提交方式
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
        //运行curl
        $data = curl_exec($ch);
        //返回结果
        if($data){
            curl_close($ch);
            return $data;
        } else {
            $error = curl_errno($ch);
            curl_close($ch);
            throw new WxPayException("curl出错，错误码:$error");
        }
    }
}
