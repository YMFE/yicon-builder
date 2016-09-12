import './IconsSetting.scss';
import React, { Component, PropTypes } from 'react';
// import { connect } from 'react-redux';
import Slick from '../Slick/index.jsx';
import IconBgGrid from '../IconBgGrid/IconBgGrid';
import Input from '../Input/Index.jsx';
import SetTag from '../SetTag/SetTag.jsx';
import { ICON_NAME } from '../../../constants/validate';
import Select from '../../common/Select/';
const Option = Select.Option;
import { autobind } from 'core-decorators';

const defaultProps = {
  title: '',
  doneArr: [],
};

const propTypes = {
  title: PropTypes.string,
  icons: PropTypes.array,
  doneArr: PropTypes.array,
  index: PropTypes.number,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  saveName: PropTypes.func,
  selectStyle: PropTypes.func,
  saveTags: PropTypes.func,
  turnLeft: PropTypes.func,
  turnRight: PropTypes.func,
  isAudit: PropTypes.bool,
  noRemoveIcon: PropTypes.bool,
};

class IconsSetting extends Component {

  @autobind
  select(index) {
    // this.props.selectEdit(index);
    this.props.onClick(index);
  }

  @autobind
  delete(index) {
    const { icons } = this.props;
    const selcIndex = this.props.index;
    const id = icons[index].id;
    let newIndex = selcIndex;
    icons.splice(index, 1);
    // this.props.deleteIcon(id, icons);
    if (selcIndex >= index) {
      newIndex = selcIndex - 1 < 0 ? 0 : selcIndex - 1;
      // this.props.selectEdit(newIndex);
    }
    // if (!icons.length) {
    //   this.props.push('/upload');
    // }
    this.props.onDelete(icons.concat(), newIndex, id);
  }

  @autobind
  blur(val) {
    const { index, icons } = this.props;
    icons[index].name = val;
    // this.props.updateWorkbench(icons.concat());
    this.props.saveName(icons.concat());
  }

  @autobind
  selectStyle(style) {
    if (typeof style !== 'string') return;
    const { index, icons } = this.props;
    icons[index].fontClass = style;
    // this.props.updateWorkbench(icons.concat());
    this.props.selectStyle(icons.concat());
  }

  @autobind
  saveTags(tags) {
    const { index, icons } = this.props;
    icons[index].tags = tags;
    // this.props.updateWorkbench(icons.concat());
    this.props.saveTags(icons.concat());
  }

  @autobind
  turnLeft() {
    const { index } = this.props;
    const newIndex = index - 1 < 0 ? 0 : index - 1;
    this.props.turnLeft(newIndex);
  }
  @autobind
  turnRight() {
    const { index, icons } = this.props;
    const newIndex = index >= icons.length - 1 ? index : index + 1;
    this.props.turnRight(newIndex);
  }

  render() {
    const { title, icons, index, isAudit, doneArr } = this.props;
    const iconDetail = icons[index];
    if (!iconDetail) {
      return null;
    }
    // 修复 placeholder 显示
    if (typeof iconDetail.fontClass !== 'string') {
      iconDetail.fontClass = undefined;
    }

    return (
      <div>
        <h2 className="upload-title">{title}</h2>
        <Slick
          itemData={icons}
          doneArr={doneArr}
          defaultCurrent={index}
          onClick={this.select}
          onDelete={this.delete}
          noRemoveIcon={isAudit}
        />
        <div className={'upload-setting clearfix'}>
          <button className={'set-pre-next-btn'} onClick={this.turnLeft}>
            <i className={'iconfont set-pre-next-icon'}>&#xf1c3;</i>
          </button>
          <IconBgGrid
            iconPath={iconDetail.path}
          />
          <div className="setting-opts">
            {isAudit &&
              <div className="upload-author">
                <span className="repository">{iconDetail.repo.name}</span>
                <span className="author">上传人：{iconDetail.user.name}</span>
              </div>
            }
            <div className="setting-opt">
              <label htmlFor="set-icon-name" className="set-opt-name">图标名称<span
                className="require"
              >*</span></label>
              <Input
                defaultValue={iconDetail.name}
                placeholder="请输入图标名称"
                extraClass="edit-name"
                blur={this.blur}
                regExp={ICON_NAME.reg}
                errMsg={ICON_NAME.message}
                ref="myInput"
              />
            </div>
            <div className="setting-opt">
              <label htmlFor="set-icon-style" className="set-opt-name">
                图标风格
                <span className="require">*</span>
              </label>
              <div className="set-input-wrap setting-opt-select">
                <Select
                  value={iconDetail.fontClass}
                  className="info_error"
                  onChange={this.selectStyle}
                >
                  <Option value="-f">线性图标</Option>
                  <Option value="-o">填色图标</Option>
                </Select>
                <div className={`error-info ${iconDetail.fontClass ? 'hide' : ''}`}>
                  请选择图标风格
                </div>
              </div>
            </div>

            <div className="setting-opt">
              <label htmlFor="set-icon-tag" className="set-opt-name">图标标签<span
                className="require"
              >*</span></label>
              <SetTag
                onTagChange={this.saveTags}
                tags={iconDetail.tags || ''}
              />
            </div>

          </div>
          <button className={'set-pre-next-btn set-pre-next-right'} onClick={this.turnRight}><i
            className={'iconfont set-pre-next-icon'}
          >&#xf1c1;</i></button>
        </div>
      </div>
    );
  }
}

IconsSetting.defaultProps = defaultProps;

IconsSetting.propTypes = propTypes;

export default IconsSetting;
