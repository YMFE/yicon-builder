import React, { Component, PropTypes } from 'react';
import timer from '../../helpers/timer';
import { Link } from 'react-router';
import { autobind } from 'core-decorators';
// import { Icon } from '../../components/';
import { InfoTypeDetail } from '../../constants/utils.js';
import classnames from 'classnames';
import ReactCSSTransitionsGrop from 'react-addons-css-transition-group';
class InfoItem extends Component {

  static propTypes = {
    tag: PropTypes.string,
    logCreator: PropTypes.object,
    tit: PropTypes.string,
    showTitleHtml: PropTypes.bool,
    item: PropTypes.object,
    timeStr: PropTypes.string,
    isNew: PropTypes.bool,
    extraClass: PropTypes.string,
    timeString: PropTypes.string,
    children: PropTypes.element,
    hasScope: PropTypes.bool,
    showDetail: PropTypes.bool,
    onShowDetail: PropTypes.func,
  }

  static defaultProps = {
    logCreator: {},
  };

  getTitle() {
    const { item, showTitleHtml, tit } = this.props;
    if (showTitleHtml) {
      return this.getDescribeForInfo(item);
    }
    if (tit) {
      return <p className="title">{tit}</p>;
    }
    return null;
  }

  @autobind
  getDescribeForInfo({ operation, scope, project, repo, type }) {
    const regExp = /@([^@]+)@/g;
    let prefix = null;
    let result = regExp.exec(operation);
    let content = [];
    let lastIndex = 0;
    let index = 0;

    while (result !== null) {
      let text;
      const matched = result[1];

      index = result.index;
      // 先处理下匹配之前的部分
      const prevText = operation.slice(lastIndex, index);
      if (prevText.length) content.push(<span key={lastIndex}>{prevText}</span>);
      lastIndex = regExp.lastIndex;

      // 处理下匹配到的关键词
      const data = JSON.parse(matched);
      // 处理一下各种日志的情况
      const keys = Object.keys(data);
      // 我们一般只有一个 key
      const firstKey = keys[0];
      if (firstKey.indexOf('icon') > -1 || firstKey.indexOf('user') > -1) {
        text = data[firstKey].name;
      } else {
        text = data[firstKey];
      }
      content.push(<span key={index} className="key">{text}</span>);
      result = regExp.exec(operation);
    }
    // 查看尾巴是否有未捕获的
    const tailText = operation.slice(lastIndex, operation.length);
    if (tailText.length) content.push(<span key={lastIndex}>{tailText}</span>);

    if (this.props.hasScope) {
      const scopeData = scope === 'project' ? project : repo;
      if (scopeData) {
        const link = scope === 'project'
          ? `/projects/${scopeData.id}`
          : `/repositories/${scopeData.id}`;

        prefix = (
          <span><Link to={link}>{scopeData.name}</Link>：</span>
        );
      } else {
        prefix = <span>已删除项目：</span>;
      }
    }
    let detailEle = null;
    if (InfoTypeDetail.indexOf(type) !== -1) {
      const classList = ['iconfont', 'switch'];
      if (this.props.showDetail) {
        classList.push('show');
      }
      detailEle = (
        <span onClick={this.props.onShowDetail}>
          <i className={classList.join(' ')}>&#xf028;</i>
        </span>
      );
    }
    return <p className="title">{prefix}{content}{detailEle}</p>;
  }

  render() {
    const classList = classnames({
      new: this.props.isNew,
      [this.props.extraClass]: this.props.extraClass,
    });
    const { name } = this.props.logCreator;
    return (
      <dl className={classList}>
        <dt className="description">
          <p className="time">
          {
            this.props.timeString ?
            this.props.timeString :
            timer(this.props.timeStr)
          }
          </p>
          <p className="tag">{name || this.props.tag}</p>
        </dt>
        <dd className="content">
          {this.getTitle()}
          <ReactCSSTransitionsGrop
            transitionName="timeline-content-detail"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}
          >
            {this.props.children}
          </ReactCSSTransitionsGrop>
        </dd>
      </dl>
    );
  }
}

export default InfoItem;
