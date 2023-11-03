import { Singleton } from "typescript-ioc";
import GroupFiSDKFacade, { SimpleDataExtended } from "groupfi-sdk-facade"
import { IMessage } from 'iotacat-sdk-core'
// IMMessage <-> UInt8Array
// IRecipient <-> UInt8Array
@Singleton
export class GroupFiService {
    private _bootstraped: boolean = false

    get isBootstraped() {
        return this._bootstraped
    }

    async bootstrap() {
        await GroupFiSDKFacade.bootstrap();
        this._bootstraped = true
    }
    async setupGroupFiMqttConnection(connect:any) {
        await GroupFiSDKFacade.setupMqttConnection(connect);
    }
    getObjectId(obj: Record<string, SimpleDataExtended>) {
        return GroupFiSDKFacade.getObjectId(obj)
    }
    async getInboxMessages(cotinuationToken?:string): Promise<{
        messageList: IMessage[],
        nextToken?: string | undefined
    }> {
        const res = await GroupFiSDKFacade.getInboxMessages(cotinuationToken);
        // log
        console.log('getInboxMessages', res);
        return res;
    }
    _offListenningNewMessage: (() => void) | undefined
    onNewMessage(callback: (message: IMessage) => void) {
        this._offListenningNewMessage = GroupFiSDKFacade.listenningNewMessage(callback);
    }
    offNewMessage(){
        this._offListenningNewMessage?.();
    }

    groupNameToGroupId(groupName: string) {
        return GroupFiSDKFacade.groupNameToGroupId(groupName)
    }

    async loadGroupMemberAddresses(groupId: string) {
        return await GroupFiSDKFacade.loadGroupMemberAddresses(groupId)
    }

    async loadGroupVotesCount(groupId: string) {
        return await GroupFiSDKFacade.loadGroupVotesCount(groupId)
    }

    async isGroupPublic(groupId: string) {
        return await GroupFiSDKFacade.isGroupPublic(groupId)
    }

    async getGroupVoteRes(groupId: string) {
        return await GroupFiSDKFacade.getGroupVoteRes(groupId)
    }

    async voteOrUnVoteGroup(groupId: string, vote: number | undefined) {
        if(vote === undefined) {
            await GroupFiSDKFacade.unvoteGroup(groupId)
        }else{
            await GroupFiSDKFacade.voteGroup(groupId, vote)
        }
    }

    async setupIotaMqttConnection(mqttClient: any) {
        return await GroupFiSDKFacade.setupIotaMqttConnection(mqttClient)
    }

    async getAddressStatusInGroup(groupId: string): Promise<{
        isGroupPublic: boolean
        muted: boolean
        isQualified: boolean
        marked: boolean
    }> {
        return await GroupFiSDKFacade.getAddressStatusInGroup(groupId)
    }

    groupIdToGroupName(groupId: string) {
        return GroupFiSDKFacade.groupIdToGroupName(groupId)   
    }

    sha256Hash(address: string) {
        return GroupFiSDKFacade.sha256Hash(address)
    }

    async enteringGroupByGroupId(groupId: string) {
        return await GroupFiSDKFacade.enteringGroupByGroupId(groupId)
    }
    async sendMessageToGroup(groupId: string, message: string):Promise<{messageSent:IMessage}> {
        return await GroupFiSDKFacade.sendMessage(groupId, message) as {messageSent:IMessage}
    }

    async getUserGroupReputation(groupId: string) {
        return await GroupFiSDKFacade.getUserGroupReputation(groupId)
    }

    async leaveGroup(groupId: string) {
        return await GroupFiSDKFacade.leaveGroup(groupId)
    }

    async joinGroup(groupId: string) {
        return await GroupFiSDKFacade.joinGroup(groupId)
    }

    getUserAddress() {
        return GroupFiSDKFacade.getUserAddress()
    }

    async muteGroupMember(groupId: string, memberAddress: string) {
        return await GroupFiSDKFacade.muteGroupMember(groupId, memberAddress)
    }

    async unMuteGroupMember(groupId: string, memberAddress: string) {
        return await GroupFiSDKFacade.unMuteGroupMember(groupId, memberAddress)
    }

    async getGroupMuteMembers(groupId: string) {
        return await GroupFiSDKFacade.getGroupMuteMembers(groupId)
    }

    async loadAddressMemberGroups(address: string) {
        return await GroupFiSDKFacade.loadAddressMemberGroups(address)
    }
}