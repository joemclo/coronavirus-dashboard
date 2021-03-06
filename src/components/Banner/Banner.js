// @flow

import React, { useState, useEffect } from "react";

import { useLocation } from "react-router";

import useGenericAPI from "hooks/useGenericAPI";
import useTimestamp from "hooks/useTimestamp";
import Loading from "components/Loading";

import html from "remark-html";
import remark from "remark";
import externalLink from "remark-external-links";
import moment from "moment";

import type { ComponentType } from 'react';
import type { BannerType } from "./Banner.types";

import { BannerBase, BannerContent, Body, Timestamp } from "./Banner.styles";


const BannerBody: ComponentType<*> = ({ rawBody, ...props }) => {

    const [data, setData] = useState("");

    useEffect(() => {
        remark()
            .use(externalLink)
            .use(html)
            .process(rawBody, (err, text) => {
                if ( !err )
                    setData(String(text));
                else
                    console.error(err);
            });
    }, [ rawBody ]);

    return <Body className={ "markdown" }
                 dangerouslySetInnerHTML={{ __html: data }}
                 { ...props }/>

};  // Banner Body


const bannerFilter = ( timestamp: string, pathname: string ): (BannerType => boolean) => {

    const ts = moment(timestamp);

    return ( { appearByUpdate, disappearByUpdate, displayUri=[] }: BannerType ): boolean => {

        if ( moment(appearByUpdate) > ts || ts > moment(disappearByUpdate) ) return false;

        return (
            displayUri.length === 0 ||
            displayUri.includes(uri => uri === pathname.toLowerCase())
        )

    }

};  // bannerFilter


const Banner: ComponentType<*> = ({ ...props }) => {

    const banners: BannerType[] = useGenericAPI("banner", null);
    const timestamp = useTimestamp();
    const { pathname } = useLocation();

    if ( banners === null ) return <Loading/>;
    if ( !banners?.length ) return null;

    return <>{
        banners
            .filter(bannerFilter(timestamp, pathname))
            .map((banner, index) =>
                <BannerBase key={ `banner-${index}-${banner?.appearByUpdate}` } { ...props }>
                    <BannerContent>
                        <Timestamp dateTime={ moment(banner?.appearByUpdate).toISOString() }>{
                            moment(banner?.appearByUpdate).format("DD MMMM YYYY")
                        }</Timestamp>
                        <BannerBody rawBody={ banner?.body ?? "" }/>
                    </BannerContent>
                </BannerBase>
            )
    }</>

};  // Banner


export default Banner;
