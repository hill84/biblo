import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import React from 'react';
import { Link } from 'react-router-dom';
import { uid, userBooksRef } from '../config/firebase';
import { icon } from '../config/icons';
import { stringType } from '../config/types';
import Cover from './cover';
import { skltn_shelfRow } from './skeletons';

export default class Shelf extends React.Component {
    state = {
        luid: uid,
        uid: this.props.uid,
        shelf: this.props.shelf || 'bookInShelf',
        userBooks: [],
        anchorEl: null,
        isOpenOrderMenu: false,
        orderBy: {type: 'added_num', label: 'Data aggiunta'},
        desc: true,
        view: 'coverview',
        loading: true,
        errors: {},
        authError: ''
    }

    static propTypes = {
        uid: stringType.isRequired
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (uid !== prevState.luid) { return { luid: uid }; }
        if (nextProps.uid !== prevState.uid) { return { uid: nextProps.uid }; }
        return null;
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchUserBooks(this.props.uid);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this._isMounted) {
            if (this.state.uid !== prevState.uid || this.state.orderBy !== prevState.orderBy || this.state.desc !== prevState.desc) {
                this.fetchUserBooks(this.state.uid);
            }
        }
    }

    fetchUserBooks = uid => {
        userBooksRef(uid).where(this.state.shelf, '==', true).orderBy(this.state.orderBy.type, this.state.desc ? 'desc' : 'asc').limit(14).onSnapshot(snap => {
            this.setState({ loading: true });
            if (!snap.empty) {
                //console.log(snap);
                let snapUserBooks = [];
                snap.forEach(userBook => {
                    //console.log(userBook.id);
                    snapUserBooks.push({
                        ...userBook.data(),
                        bid: userBook.id
                    });
                    this.setState({
                        userBooks: snapUserBooks,
                        loading: false
                    });
                });
            } else {
                //console.log('No books');
                this.setState({
                    userBooks: [],
                    loading: false
                });
            }
        });
    }

    onChangeOrder = (event, value) => this.setState({ orderBy: value, isOpenOrderMenu: false });

    onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

    onToggleView = value => this.setState({ view: value });

    onToggleOrderMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
        this.setState(prevState => ({ isOpenOrderMenu: !prevState.isOpenOrderMenu }));
    }

    render(props) {
        const { desc, isOpenOrderMenu, luid, loading, orderBy, shelf, uid, userBooks, view } = this.state;
        const isOwner = () => luid === uid;
        const covers = userBooks && userBooks.map((book, index) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} index={index} rating={shelf === 'bookInShelf'} /></Link>);

        return (
            <div className="shelf-container" ref="shelfComponent">
                <div className="head nav">
                    <div className="row">
                        <div className="col info-row">
                            <button 
                                className={`btn sm flat counter ${view === 'coverview' ? 'active' : null}`} 
                                title="Cover view" 
                                onClick={() => this.onToggleView('coverview')}>
                                {icon.viewGrid()}
                            </button>
                            <button 
                                className={`btn sm flat counter ${view === 'stacked' ? 'active' : null}`} 
                                title="Stack view" 
                                onClick={() => this.onToggleView('stacked')}>
                                {icon.viewSequential()}
                            </button>
                            <span className="counter">{userBooks.length} libri</span>
                        </div>
                        <div className="col-auto info-row">
                            <span className="counter last hide-xs">Ordina per</span>
                            <button className="btn sm flat counter" onClick={this.onToggleOrderMenu}>{orderBy.label}</button>
                            <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Discendente' : 'Ascendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                            <Popover 
                                open={isOpenOrderMenu} 
                                onRequestClose={this.onToggleOrderMenu} 
                                anchorEl={this.state.anchorEl} 
                                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                                <Menu onChange={this.onChangeOrder}>
                                    <MenuItem value={{type: 'added_num', label: 'Data aggiunta'}} primaryText="Data aggiunta" />
                                    <MenuItem value={{type: 'title', label: 'Titolo'}} primaryText="Titolo" />
                                    {shelf === 'bookInShelf' && <MenuItem value={{type: 'rating_num', label: 'Valutazione'}} primaryText="Valutazione" />}
                                    <MenuItem value={{type: 'authors', label: 'Autore'}} primaryText="Autore" />
                                </Menu>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="shelf">
                    <div className="collection hoverable-items">
                        {loading ? skltn_shelfRow :
                            <div className={`shelf-row ${view}`}>
                                {isOwner() &&
                                    <Link to="/books/add">
                                        <div className="book empty">
                                            <div className="cover">+</div>
                                            <div className="info"><b className="title">Aggiungi libro</b></div>
                                        </div>
                                    </Link>
                                }
                                {covers}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}