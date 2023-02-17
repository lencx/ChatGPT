###
 # @Author: Vincent Young
 # @Date: 2023-02-17 19:34:47
 # @LastEditors: Vincent Young
 # @LastEditTime: 2023-02-17 19:37:11
 # @FilePath: /ChatGPT/updateBrewVersion.sh
 # @Telegram: https://t.me/missuo
 # 
 # Copyright © 2023 by Vincent, All Rights Reserved. 
### 

update_chatgpt(){
    last_version=$(curl -Ls "https://api.github.com/repos/lencx/ChatGPT/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/v//g')
    sed -i "s/version.*/version \"${last_version}\"/g" casks/chatgpt.rb
}
update_chatgpt