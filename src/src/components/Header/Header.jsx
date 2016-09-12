import './Header.scss';
import React, { PropTypes, Component } from 'react';
import Nav from './Nav/Nav';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import ToolUserName from './ToolUserName/ToolUserName.jsx';
// import LogOut from './LogOut/LogOut.jsx';
import Search from './Search/Search';
import Logo from './Logo/Logo';
import Cart from './Cart/Cart';
import Info from './Info/Info';
import classnames from 'classnames';
// import { autobind } from 'core-decorators';
import { fetchTinyRepository } from '../../actions/repository';
import {
  toggleCartListDisplay,
  getIconsInLocalStorage,
} from '../../actions/cart.js';
import {
  fetchSearchResult,
} from '../../actions/search.js';

const iconManageList = [
  { name: '图标工作台', href: '/workbench', auth: 'login' },
  { name: '我的图标项目', href: '/projects', auth: 'login' },
  { name: '图标上传历史', href: '/user/icons', auth: 'login' },
  { name: '图标审核', href: '/auditing', auth: 'owner' },
];

@connect(
  (state) => ({
    isLoginUser: state.user.info.login,
    isShowCartList: state.cart.toggleCartListDisplay,
    searchValue: state.search.value,
    allReposotoryList: state.repository.allReposotoryList,
  }),
  {
    toggleCartListDisplay,
    getIconsInLocalStorage,
    fetchSearchResult,
    fetchTinyRepository,
  }
)
class Header extends Component {
  componentWillMount() {
    this.props.fetchTinyRepository();
  }
  render() {
    const { allReposotoryList, extraClass, isLoginUser } = this.props;
    const list = allReposotoryList.map(r => ({
      name: r.name, href: `/repositories/${r.id}`,
    }));
    const className = classnames('global-header', {
      [extraClass]: extraClass,
    });

    return (
      <header className={className}>
        <div className="header-fixed">
          <div className="container">
            <Logo />
            <nav className="nav quick-menu">
              <ul>
                <Nav name="图标库" list={list} />
                <Nav name="图标管理" list={iconManageList} />
              </ul>
            </nav>
            <div className="quick-menu nav-menu-info">
              <ul className="clearfix">
                <ToolUserName />
                {isLoginUser && <Info />}
                <Cart
                  isShowCart={this.props.isShowCartList}
                />
                {isLoginUser &&
                  <li className="lists">
                    <Link to="/upload" className="upload">
                      <i className="iconfont">&#xf50a;</i>
                    </Link>
                  </li>
                }
                <Search
                  defaultValue={this.props.searchValue}
                  onSubmit={this.props.fetchSearchResult}
                />
              </ul>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  isLoginUser: PropTypes.bool,
  iconDatabase: PropTypes.array,
  className: PropTypes.string,
  extraClass: PropTypes.string,
  searchValue: PropTypes.string,
  onSearch: PropTypes.func,
  isShowCartList: PropTypes.bool,
  getIconsInLocalStorage: PropTypes.func,
  allReposotoryList: PropTypes.array,
  fetchSearchResult: PropTypes.func,
  fetchTinyRepository: PropTypes.func,
};

export default Header;
