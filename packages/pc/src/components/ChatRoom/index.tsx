import { classNames } from 'utils'
import EmojiSVG from 'public/icons/emoji.svg'

import MuteRedSVG from 'public/icons/mute-red.svg'
import {
  ContainerWrapper,
  HeaderWrapper,
  ReturnIcon,
  MoreIcon,
  GroupTitle,
  Loading,
  GroupFiServiceWrapper
} from '../Shared'

import EmojiPicker, { EmojiStyle, EmojiClickData } from 'emoji-picker-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import {
  useMessageDomain,
  IMessage,
  EventGroupMemberChanged,
  GroupFiService,
  HeadKey
} from 'groupfi_trollbox_shared'

import { addGroup } from 'redux/myGroupsSlice'
import { useAppDispatch } from 'redux/hooks'

import { RowVirtualizerDynamic } from './VirtualList'

import MessageInput from './MessageInput'

export interface QuotedMessage {
  sender: string
  message: string
}

function ChatRoom(props: { groupId: string; groupFiService: GroupFiService }) {
  const { groupId, groupFiService } = props

  const { messageDomain } = useMessageDomain()

  const tailDirectionAnchorRef = useRef<{
    directionMostMessageId?: string
    chunkKeyForDirectMostMessageId?: string
  }>({})

  const fetchingMessageRef = useRef<{
    fetchingOldData: boolean
    fetchingNewData: boolean
  }>({
    fetchingOldData: false,
    fetchingNewData: false
  })

  const [messageList, setMessageList] = useState<
    Array<IMessage | EventGroupMemberChanged>
  >([])

  const fetchMessageToTailDirection = async (size: number = 20) => {
    if (fetchingMessageRef.current.fetchingOldData) {
      return
    }
    fetchingMessageRef.current.fetchingOldData = true
    console.log(
      '====>fetchMessageToTailDirection',
      tailDirectionAnchorRef.current
    )
    const { chunkKeyForDirectMostMessageId, directionMostMessageId } =
      tailDirectionAnchorRef.current
    try {
      const { messages, ...rest } =
        await messageDomain.getConversationMessageList({
          groupId,
          key: chunkKeyForDirectMostMessageId ?? HeadKey,
          messageId: directionMostMessageId,
          direction: 'tail',
          size
        })
      console.log('====> fetchMessageToTailDirection', { ...messages }, rest)
      tailDirectionAnchorRef.current.chunkKeyForDirectMostMessageId =
        rest.chunkKeyForDirectMostMessageId
      if (rest.directionMostMessageId) {
        tailDirectionAnchorRef.current.directionMostMessageId =
          rest.directionMostMessageId
      }

      if (messages.length > 0) {
        const latestMessageId = messages[0].messageId

        // messages is toward tail direction, so reverse it, then prepend to messageList
        setMessageList((prev) => [...messages.reverse(), ...prev])

        if (
          headDirectionAnchorRef.current.directionMostMessageId === undefined
        ) {
          console.log(
            '====> fetchMessageToTailDirection set headDirectionAnchorRef',
            latestMessageId
          )
          headDirectionAnchorRef.current.directionMostMessageId =
            latestMessageId
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      fetchingMessageRef.current.fetchingOldData = false
    }
  }

  const headDirectionAnchorRef = useRef<{
    directionMostMessageId?: string
    chunkKeyForDirectMostMessageId?: string
  }>({})

  const fetchMessageToHeadDirection = async (size: number = 20) => {
    if (fetchingMessageRef.current.fetchingNewData) {
      return
    }
    fetchingMessageRef.current.fetchingNewData = true

    console.log(
      '====>fetchMessageToHeadDirection',
      headDirectionAnchorRef.current
    )

    const { chunkKeyForDirectMostMessageId, directionMostMessageId } =
      headDirectionAnchorRef.current

    try {
      const { messages, ...rest } =
        await messageDomain.getConversationMessageList({
          groupId,
          key: chunkKeyForDirectMostMessageId ?? HeadKey,
          messageId: directionMostMessageId,
          direction: 'head',
          size: 5
        })

      console.log(
        '====>messages in fetchMessageToHeadDirection',
        {
          ...messages
        },
        rest
      )
      headDirectionAnchorRef.current.chunkKeyForDirectMostMessageId =
        rest.chunkKeyForDirectMostMessageId
      if (rest.directionMostMessageId) {
        console.log(
          '====> fetchMessageToHeadDirection set directionMostMessageId',
          rest.directionMostMessageId
        )
        headDirectionAnchorRef.current.directionMostMessageId =
          rest.directionMostMessageId
      }

      setMessageList((prev) => [...prev, ...messages])

      // if (messages.length) {
      //   setMessageList((prev) => {
      //     // append to prev, then reverse, then dedup, then reverse
      //     const merged = [...prev, ...messages].reverse()
      //     const seenMessageId = new Set<string>()
      //     const deduped = []
      //     for (const message of merged) {
      //       if (!seenMessageId.has(message.messageId)) {
      //         seenMessageId.add(message.messageId)
      //         deduped.push(message)
      //       }
      //     }
      //     return deduped.reverse()
      //   })
      // }
    } catch (e) {
      console.error(e)
    } finally {
      fetchingMessageRef.current.fetchingNewData = false
    }
  }

  const fetchMessageToHeadDirectionWrapped = useCallback(async () => {
    if (headDirectionAnchorRef.current.directionMostMessageId !== undefined) {
      await fetchMessageToHeadDirection()
    } else {
      await fetchMessageToTailDirection(40)
    }
  }, [])

  const fetchMessageToTailDirectionWrapped = useCallback(async () => {
    fetchMessageToTailDirection(40)
  }, [])

  const onGroupMemberChanged = useCallback(
    (groupMemberChangedEvent: EventGroupMemberChanged) => {
      if (
        groupMemberChangedEvent.groupId === groupId &&
        groupMemberChangedEvent.isNewMember
      ) {
        setMessageList((prev) => [...prev, groupMemberChangedEvent])
      }
    },
    []
  )

  const init = useCallback(async () => {
    await fetchMessageToTailDirection(40)
    messageDomain.onConversationDataChanged(
      groupId,
      fetchMessageToHeadDirectionWrapped
    )
    messageDomain.onGroupMemberChanged(onGroupMemberChanged)
  }, [])

  const deinit = () => {
    messageDomain.offGroupMemberChanged(onGroupMemberChanged)
    messageDomain.offConversationDataChanged(
      groupId,
      fetchMessageToHeadDirectionWrapped
    )
    messageDomain.offIsHasPublicKeyChanged(
      isHasPublicKeyChangedCallbackRef.current
    )
  }

  const [addressStatus, setAddressStatus] = useState<{
    isGroupPublic: boolean
    marked: boolean
    muted: boolean
    isQualified: boolean
    isHasPublicKey: boolean
  }>()
  const isHasPublicKeyChangedCallbackRef = useRef<
    (param: { isHasPublicKey: boolean }) => void
  >(() => {})
  const fetchAddressStatus = async () => {
    console.log('entering fetchAddressStatus')
    try {
      const status = await groupFiService.getAddressStatusInGroup(groupId)
      const isHasPublicKey = messageDomain.getIsHasPublicKey()
      const appStatus = {
        ...status,
        isHasPublicKey
      }
      console.log('***Address Status', status)
      isHasPublicKeyChangedCallbackRef.current = (value) => {
        const { isHasPublicKey } = value ?? {}
        console.log('***isHasPublicKeyChangedCallbackRef', isHasPublicKey)
        setAddressStatus((prev) => {
          if (prev !== undefined) {
            return { ...prev, isHasPublicKey }
          }
          return prev
        })
      }
      messageDomain.onIsHasPublicKeyChanged(
        isHasPublicKeyChangedCallbackRef.current
      )
      setAddressStatus(appStatus)
    } catch (e) {
      console.error(e)
    }
  }

  const refresh = useCallback(() => {
    setAddressStatus((s) =>
      s !== undefined ? { ...s, marked: true } : undefined
    )
  }, [addressStatus])

  const enteringGroup = async () => {
    await messageDomain.enteringGroupByGroupId(groupId)
    messageDomain.clearUnreadCount(groupId)
  }

  useEffect(() => {
    console.log('ChatRoom useEffect')
    init()
    fetchAddressStatus()
    enteringGroup()

    return () => {
      deinit()
    }
  }, [])

  const [isSending, setIsSending] = useState(false)

  const [quotedMessage, setQuotedMessage] = useState<QuotedMessage | undefined>(
    undefined
  )

  return (
    <ContainerWrapper>
      <HeaderWrapper>
        <ReturnIcon />
        <GroupTitle
          showGroupPrivateIcon={addressStatus?.isGroupPublic === false}
          title={groupFiService.groupIdToGroupName(groupId) ?? ''}
        />
        <MoreIcon to={'info'} />
      </HeaderWrapper>
      <div
        className={classNames(
          'flex-1 overflow-x-hidden overflow-y-auto relative'
        )}
      >
        <RowVirtualizerDynamic
          onQuoteMessage={setQuotedMessage}
          messageList={messageList.slice().reverse()}
          groupFiService={groupFiService}
          loadPrevPage={fetchMessageToTailDirectionWrapped}
          groupId={groupId}
        />
      </div>
      <div className={classNames('flex-none basis-auto')}>
        <div className={classNames('px-5 pb-5')}>
          {addressStatus !== undefined ? (
            addressStatus?.marked &&
            addressStatus.isQualified &&
            !addressStatus.muted ? (
              isSending ? (
                <ChatRoomSendingButton />
              ) : (
                <MessageInput
                  onQuoteMessage={setQuotedMessage}
                  groupId={groupId}
                  onSend={setIsSending}
                  quotedMessage={quotedMessage}
                />
              )
            ) : (
              <ChatRoomButton
                groupId={groupId}
                marked={addressStatus.marked}
                muted={addressStatus.muted}
                qualified={addressStatus.isQualified}
                isHasPublicKey={addressStatus.isHasPublicKey}
                refresh={refresh}
                groupFiService={groupFiService}
              />
            )
          ) : (
            <ChatRoomLoadingButton />
          )}
        </div>
      </div>
    </ContainerWrapper>
  )
}

export function TrollboxEmoji(props: {
  messageInputRef: React.MutableRefObject<HTMLDivElement | null>
  lastRange: Range | undefined
}) {
  const { messageInputRef, lastRange } = props
  const [show, setShow] = useState(false)

  return (
    <>
      <img
        className={classNames('flex-none cursor-pointer mr-2')}
        src={EmojiSVG}
        onClick={() => setShow((s) => !s)}
      />
      {show && (
        <div className={classNames('absolute top-[-460px] left-[-5px]')}>
          <EmojiPicker
            emojiStyle={EmojiStyle.TWITTER}
            previewConfig={{
              showPreview: false
            }}
            skinTonesDisabled={true}
            onEmojiClick={function (
              emojiData: EmojiClickData,
              event: MouseEvent
            ) {
              console.log('selected emoji', emojiData)
              const { imageUrl, emoji, unified } = emojiData
              const img = document.createElement('img')
              img.src = imageUrl
              img.alt = emoji
              // img.dataset['tag'] = GroupFiEmojiTag
              // img.dataset['value'] = formGroupFiEmojiValue(unified)
              img.innerText = `%{emo:${unified}}`
              img.className = 'emoji_in_message_input'
              if (lastRange !== undefined) {
                lastRange.insertNode(img)
                const range = document.createRange()
                range.selectNodeContents(messageInputRef.current!)
                range.collapse(false)
                const selection = getSelection()
                selection!.removeAllRanges()
                selection!.addRange(range)
              }
              setShow(false)
            }}
          />
        </div>
      )}
    </>
  )
}

function ChatRoomLoadingButton() {
  return (
    <button className={classNames('w-full rounded-2xl py-3 bg-[#F2F2F7]')}>
      <div className={classNames('py-[7px]')}>
        <Loading marginTop="mt-0" type="dot-typing" />
      </div>
    </button>
  )
}

function ChatRoomSendingButton() {
  return (
    <button className={classNames('w-full rounded-2xl py-3 bg-[#F2F2F7]')}>
      Sending...
    </button>
  )
}
function ChatRoomButton(props: {
  groupId: string
  marked: boolean
  qualified: boolean
  muted: boolean
  isHasPublicKey: boolean
  refresh: () => void
  groupFiService: GroupFiService
}) {
  const appDispatch = useAppDispatch()
  const {
    marked,
    qualified,
    muted,
    isHasPublicKey,
    groupId,
    refresh,
    groupFiService
  } = props
  const { messageDomain } = useMessageDomain()
  const [loading, setLoading] = useState(false)

  if (loading) {
    return <ChatRoomLoadingButton />
  }

  return (
    <button
      className={classNames(
        'w-full rounded-2xl py-3',
        marked || muted ? 'bg-[#F2F2F7]' : 'bg-primary'
      )}
      onClick={async () => {
        if (!isHasPublicKey) {
          alert('still not has public key')
          return
        }
        if (qualified || !marked) {
          setLoading(true)
          await (qualified
            ? messageDomain.joinGroup(groupId)
            : groupFiService.markGroup(groupId))
          appDispatch(
            addGroup({
              groupId,
              groupName: groupFiService.groupIdToGroupName(groupId) ?? 'unknown'
            })
          )
          refresh()
          setLoading(false)
        }
      }}
    >
      <span
        className={classNames(
          'text-base',
          muted ? 'text-[#D53554]' : marked ? 'text-[#3671EE]' : 'text-white'
        )}
      >
        {muted ? (
          <>
            <img
              src={MuteRedSVG}
              className={classNames('inline-block mr-3 mt-[-3px]')}
            />
            <span>You are muted in this group</span>
          </>
        ) : qualified ? (
          'JOIN'
        ) : marked ? (
          <span>
            Buy <span className={classNames('font-medium')}>IOTABOTS</span> to
            speak in this group
          </span>
        ) : (
          'MARK'
        )}
      </span>
    </button>
  )
}

export function MemberJoinMessage(props: { memberAddress: string }) {
  return (
    <div className={classNames('px-5 flex flex-row py-2.5')}>joined Group</div>
  )
}

export default () => (
  <GroupFiServiceWrapper<{ groupFiService: GroupFiService; groupId: string }>
    component={ChatRoom}
    paramsMap={{
      id: 'groupId'
    }}
  />
)
