<?php
/**
 * Author: huanglele
 * Date: 2016/6/28
 * Time: 下午 09:02
 * Description:
 */

namespace Home\Controller;


use Think\Controller;

class ToolController extends Controller
{

    /**
     * 查询一定条件的商品列表
     * @param $map Array 条件
     * @param $limit Number 查询数量
     * @param $order String 排序
     * @return mixed Array 返回结果集
     */
    public function getGoods($map,$limit,$order){
        return M('goods')->where($map)->order($order)->limit($limit)->field('gid,img,name,buy_price as price')->select();
    }

    /**
     * @param $table 数据库模型
     * @param $map 查询限制条件
     * @param $order 排序
     * @param bool|false $field 需要查询的字段
     * @return array 返回查询到的数据数组
     */
    public function getList($table,$map,$order,$field=false){
        $M = M($table);
        $count = $M->where($map)->count();
        $Page = new\Think\Page($count,16);
        $show = $Page->show();
        if($field){
            $list = $M->where($map)->field($field)->order($order)->limit($Page->firstRow,$Page->listRows)->select();
        }else{
            $list = $M->where($map)->order($order)->limit($Page->firstRow,$Page->listRows)->select();
        }
        $this->assign('list',$list);
        $this->assign('page',$show);
        return $list;
    }
}