'use client';

import { useCustomerStore } from "@/stores/customerStore";
import axios from "axios";

export default function SetAccessToken() {
    console.log("SetAccessToken run");
    const { setAccessToken,getAccessToken } = useCustomerStore();
    let accessToken = "";
    accessToken = getAccessToken();
    console.log("accessToken", accessToken);
    const getAccessToken_url = "/api/login/getaccesstoken";
    if(accessToken=="") {
        console.log("hihihihihhi");
        axios.get(getAccessToken_url,{withCredentials: true}).then(function(res){
            if(res.data){
                setAccessToken(res.data);
            }
        });
    }
}