import React from 'react';
import { Link } from 'react-router';

export default () => (
  <div className="upload-notes">
    <div className="note-bar">
      <h3 className="note-title">图标制作注意事项</h3>
      <a href="/resource/template.ai" className="download">下载AI模板</a>
      <div className="to-detail">
        <Link className="to-detail-link" to="/help">
          查看详细说明
          <i className="iconfont to-detail-arr">&#xf1c1;</i>
        </Link>
      </div>
    </div>
    <ul className="note-list">
      <li className="note-item">
        <div className="note-img-box img1"></div>
        <h4 className="note-item-title">路径闭合</h4>
        <p className="note-item-txt">图形要封闭，不能有出现未闭合的路径</p>
      </li>
      <li className="note-item">
        <div className="note-img-box img2"></div>
        <h4 className="note-item-title">形状合并</h4>
        <p className="note-item-txt">如果有两个以上的图形，或者有布尔关系的图形请对图形合并并且扩展</p>
      </li>
      <li className="note-item">
        <div className="note-img-box img3"></div>
        <h4 className="note-item-title">控制节点数量</h4>
        <p className="note-item-txt">图形尽量减少节点使用，简化图形，去除无用节点</p>
      </li>
      <li className="note-item">
        <div className="note-img-box img4"></div>
        <h4 className="note-item-title">图标尺寸</h4>
        <p className="note-item-txt">请务必在限定边框内绘制完成图形，尽量撑满绘制区域，以16X16点阵为对齐参考。</p>
      </li>
    </ul>
  </div>
);
