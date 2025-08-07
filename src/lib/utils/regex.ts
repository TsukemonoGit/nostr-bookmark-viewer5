export const hashtagRegex =
	/(?<![\p{XID_Continue}\p{Extended_Pictographic}\p{Emoji_Component}_+\-])[#﹟＃](?<hashtag>(?:(?![#﹟＃])(?:\p{XID_Continue}|\p{Extended_Pictographic}|\p{Emoji_Component}|[_+\-]))+)/gu;
export const urlRegex = /(https?:\/\/+[^\s"'<`\]]+[^\s"'<`:\].]+)/g;
export const nip33Regex = /^([0-9]{1,9}):([0-9a-fA-F]{64}):(.*)$/;
export const relayRegex = /wss?:\/\/[a-zA-Z0-9.-]+(:[0-9]{1,5})?(\/[a-zA-Z0-9._~%+-]*)*/g;
export const hexRegex = /^[0-9a-fA-F]{64}$/;
