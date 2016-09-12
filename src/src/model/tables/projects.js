import { seq, Seq } from './_db';

export default seq.define('projects', {
  name: {
    type: Seq.STRING,
    allowNull: false,
    unique: true,
    comment: '项目名称',
  },
  info: {
    type: Seq.STRING,
    comment: '项目info，废置不显示',
  },
  public: {
    type: Seq.BOOLEAN,
    defaultValue: false,
    comment: '是否是公开项目，废置',
  },
  baseline: {
    type: Seq.BOOLEAN,
    defaultValue: false,
    comment: '是否调整基线',
  },
});
