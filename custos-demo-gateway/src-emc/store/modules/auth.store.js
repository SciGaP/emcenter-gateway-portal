import decode from "jwt-decode";
import {hasTokenExpired} from "../util/jwt.util";
import {custosApiAxios, identityMgtEndpoint} from "../util/custos.util";

const ACCESS_TOKEN_KEY = 'access_token';
const ID_TOKEN_KEY = 'id_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const state = {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    idToken: localStorage.getItem(ID_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
};

const actions = {
    async fetchAuthorizationEndpoint(obj, {clientId, clientSecret, redirectUri}) {
        const {data: {authorization_endpoint}} = await custosApiAxios.get(
            `${identityMgtEndpoint}/.well-known/openid-configuration`,
            {
                params: {client_id: clientId},
                headers: {'Authorization': `Bearer ${btoa(`${clientId}:${clientSecret}`)}`}
            }
        );
        window.location.href = `${authorization_endpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid&kc_idp_hint=oidc`;
    },
    async authenticateUsingCode({commit}, {clientId, clientSecret, redirectUri, tokenEndpoint, code}) {
        let {data: {access_token, id_token, refresh_token}} = await custosApiAxios.post(
            tokenEndpoint,
            {'code': code, 'redirect_uri': redirectUri, 'grant_type': 'authorization_code'},
            {
                headers: {'Authorization': `Bearer ${btoa(`${clientId}:${clientSecret}`)}`}
            }
        );
        commit("SET_TOKENS", {accessToken: access_token, idToken: id_token, refreshToken: refresh_token});
    },
    async authenticateLocally({commit}, {clientId, clientSecret, tokenEndpoint, username, password}) {
        let {data: {access_token, id_token, refresh_token}} = await custosApiAxios.post(
            tokenEndpoint,
            {'grant_type': 'password', 'username': username, 'password': password},
            {
                headers: {'Authorization': `Bearer ${btoa(`${clientId}:${clientSecret}`)}`}
            }
        );
        commit("SET_TOKENS", {accessToken: access_token, idToken: id_token, refreshToken: refresh_token});
    },
    async logout({commit, state}, {clientId, clientSecret}) {
        await custosApiAxios.post(
            `${identityMgtEndpoint}/user/logout`,
            {refresh_token: state.refreshToken},
            {
                headers: {'Authorization': `Bearer ${btoa(`${clientId}:${clientSecret}`)}`}
            }
        );
        commit("CLEAR_TOKENS");
    },
    async refreshAuthentication({commit, state}, {clientId, clientSecret}) {
        if (state.refreshToken && hasTokenExpired(state.refreshToken)) {
            let {data: {access_token, id_token, refresh_token}} = await custosApiAxios.post(
                `${identityMgtEndpoint}/token`,
                {'refresh_token': state.refreshToken, 'grant_type': 'refresh_token'},
                {
                    headers: {'Authorization': `Bearer ${btoa(`${clientId}:${clientSecret}`)}`}
                }
            ).catch(() => commit("CLEAR_TOKENS"))

            commit("SET_TOKENS", {accessToken: access_token, idToken: id_token, refreshToken: refresh_token});
        }

    }
}

const mutations = {
    SET_TOKENS(state, {accessToken, idToken, refreshToken}) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(ID_TOKEN_KEY, idToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        state.accessToken = accessToken;
        state.idToken = idToken;
        state.refreshToken = refreshToken;
    },
    CLEAR_TOKENS(state) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(ID_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);

        state.accessToken = null;
        state.idToken = null;
        state.refreshToken = null;
    }
}

const getters = {
    accessToken(state) {
        return state.accessToken;
    },
    idToken(state) {
        return state.idToken;
    },
    refreshToken(state) {
        return state.refreshToken;
    },
    authenticated(state, getters) {
        if (getters.idToken && !hasTokenExpired(state.idToken)) {
            return true;
        } else {
            return false;
        }
    },
    isAdmin(state, getters) {
        let {realm_access: {roles}} = decode(getters.accessToken);
        return roles.indexOf("admin")
    },
    currentUsername(state, getters) {
        console.log("##### currentUsername ")
        if (getters.accessToken) {
            let {preferred_username} = decode(getters.accessToken);
            console.log("##### currentUsername ", preferred_username);
            return preferred_username;
        } else {
            return null
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}