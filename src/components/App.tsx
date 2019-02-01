import React, {useContext, useEffect} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import ErrorBoundary from "./Layout/ErrorHandling";
import ScrollToTop from './Layout/ScrollToTop'
import mainPage from './MainPage/Overview'
import ShoppingCart from './Cart/Overview'
import Header from './Layout/Header'
import Shop from './Shop/Overview'
import Footer from './Layout/Footer'
import Feed from './Feed/Overview'
import ProductOverview from './Product/Overview'
import FeedDetail from './Feed/Detail'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import {connect} from "react-redux";
import {
    AUTH_INIT_USER_PROFILE,
    CART_INIT_SHOPPING_CART,
    CATEGORY_INIT_CATEGORY,
    COMMON_INIT_SHOP_INFO,
    INIT_FEEDS,
    INIT_PRODUCTS
} from "../constants/actionType";
import '../constants/icon/style.css'
import agent from '../agent'
import withWidth, {isWidthUp} from "@material-ui/core/withWidth/index";
import Checkout from './Checkout/Overview'
import ConfirmPage from './Layout/ConfirmPage'
import LoadingPage from './Layout/LoadingPage'
import '../constants/Style.css'
import SearchPage from './Search/Overview'
import _ from 'lodash'
import NotFound from './Layout/NotFound'
import MyCredits from './Layout/MyCredits'
import Register from './Auth/Register/Overview'
import Login from './Auth/Login/Overview'
import {Product} from "../interfaces/server/Product";
import {Reducer} from "../store/store";


const mapStateToProps = (state: any) => ({
    products: state.product.products,
});


const mapDispatchToProps = (dispatch: any) => ({
        initApp: (shoppingCart: string) => {
            agent.Products.initProducts().then(res =>
                dispatch(
                    {
                        type: INIT_PRODUCTS,
                        payload: res.data.data.products,
                    }
                )
            ).catch(err => dispatch(
                {
                    type: INIT_PRODUCTS,
                    payload: [],
                }
            ));

            agent.Feeds.initFeeds().then(res =>
                dispatch(
                    {
                        type: INIT_FEEDS,
                        payload: res.data.data.posts,
                    }
                )
            ).catch(err => dispatch(
                {
                    type: INIT_FEEDS,
                    payload: [],
                }
            ));
            agent.Auth.getAccount().then(user =>
                dispatch(
                    {
                        type: AUTH_INIT_USER_PROFILE,
                        payload: (user.data && user.data.data) ? user.data.data.consumers[0] : {},
                    }
                )
            ).catch(err => dispatch(
                {
                    type: AUTH_INIT_USER_PROFILE,
                    payload: {},

                }
            ));
            agent.Products.initBusiness().then(res => {

                    if (res.data.data.shops) {
                        console.log(res.data.data);
                        dispatch(
                            {
                                type: CATEGORY_INIT_CATEGORY,
                                payload: res.data.data.shops[0].tags.split(','),
                            }
                        );
                        dispatch(
                            {
                                type: COMMON_INIT_SHOP_INFO,
                                payload: res.data.data.shops[0],
                            }
                        );
                        document.title = res.data.data.shops[0].name
                    }
                }
            ).catch(err => {

                    document.title = 'One Shop';

                    dispatch(
                        {
                            type: CATEGORY_INIT_CATEGORY,
                            payload: []
                        }
                    )
                }
            );

            dispatch({
                type: CART_INIT_SHOPPING_CART,
                payload: shoppingCart,
            })


        },
        finishLoadingProducts: (products: Array<Product>) =>
            dispatch(
                {
                    type: INIT_PRODUCTS,
                    payload: products,
                }
            )

    }
);

interface Props {
    [key: string]: any
}

const App: React.FunctionComponent<Props> = props => {
    const {state, dispatch} = useContext(Reducer)

    let getAllProducts = async (page: number = 1, products: Array<Product> = []): Promise<Array<Product>> => {
        let data: Array<Product> = await agent.Products.initProducts(`?page=${page}`).then(res => res.data.data.products).catch(err => [])
        if (data.length > 0) return getAllProducts(page + 1, _.concat(products, data))
        else {
            dispatch(
                {
                    type: INIT_PRODUCTS,
                    payload: products
                }
            )
            return products
        }


    }
    let getShoppingCart = (): string => {

        let shoppingCart: string | null = localStorage.getItem('shoppingCart')
        return JSON.parse(shoppingCart !== null ? shoppingCart : '')
    }
    let initApp = async () => await props.initApp(getShoppingCart())


    useEffect(
        () => {
            initApp().then(
                async () =>
                    props.finishLoadingProducts(
                        await getAllProducts()
                    )
            )

        }, []);


    return (
        <BrowserRouter>
            <ScrollToTop>
                <ErrorBoundary>

                    <Header/>
                    <MyCredits/>

                    <div style={(isWidthUp('md', props.width)) ? {paddingTop: '76px'} : {}}>
                        <Switch>
                            <Route exact path={'/'} component={mainPage}/>
                            <Route exact path={'/404'} component={NotFound}/>
                            <Route exact path={'/login'} component={Login}/>
                            <Route exact path={'/register'} component={Register}/>
                            <Route exact path={'/products'} component={Shop}/>
                            <Route exact path={'/feeds'} component={Feed}/>
                            <Route exact path={'/feeds/:id'} component={FeedDetail}/>
                            <Route exact path={'/products/:id'} component={ProductOverview}/>
                            <Route exact path={'/checkout'} component={Checkout}/>
                            <Route exact path={'/shoppingCart'} component={ShoppingCart}/>
                            <Route exact path={'/confirmPage/:orderId'} component={ConfirmPage}/>
                            <Route exact path={'/loadingPage'} component={LoadingPage}/>
                            <Route exact path={'/search/:keyword'} component={SearchPage}/>
                            <Route component={NotFound}/>

                        </Switch>
                    </div>

                    <Footer/>
                </ErrorBoundary>
            </ScrollToTop>
        </BrowserRouter>

    )

};

//todo('add in stock logic')

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(App))
