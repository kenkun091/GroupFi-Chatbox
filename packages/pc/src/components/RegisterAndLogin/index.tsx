import { useEffect, useState } from 'react'
import { classNames } from 'utils'
import {
  Powered,
  renderCeckRenderWithDefaultWrapper,
  Spinner,
  TextWithSpinner
} from '../Shared'
import { useMessageDomain } from 'groupfi_chatbox_shared'
import TanglePayLogoSVG from 'public/icons/tanglepay-logo-1.svg'

export function Login() {
  const { messageDomain } = useMessageDomain()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  if (isLoggingIn) {
    return renderCeckRenderWithDefaultWrapper(
      <TextWithSpinner text={'Connecting...'} />
    )
  }

  return (
    <div
      className={classNames(
        'w-full h-full flex flex-col justify-between overflow-auto'
      )}
    >
      <div className={classNames('flex-auto flex flex-col justify-evenly')}>
        <div className={classNames('flex flex-col items-center')}>
          <img src={TanglePayLogoSVG} className={classNames('w-32 h-32')} />
          <div className={classNames('text-center')}>
            <div className={classNames('font-bold text-primary text-2xl')}>
              GroupFi Web3 Messaging
            </div>
            <div className={classNames('pt-2 text-primary text-sm')}>
              Decentralized Chat, Unified Community
            </div>
          </div>
        </div>
        <div className={classNames('px-5')}>
          <button
            className={classNames(`w-full h-12 bg-accent-500 rounded-xl`)}
            onClick={() => {
              messageDomain.login()
              setIsLoggingIn(true)
            }}
          >
            <span className={classNames('text-white')}>Connect</span>
          </button>
        </div>
      </div>
      <Powered />
    </div>
  )
}

export function Register() {
  const { messageDomain } = useMessageDomain()
  const [isRegistering, setIsRegistering] = useState<boolean>(false)
  const [isEncryptionPublicKeySet, setIsEncryptionPublicKeySet] =
    useState<boolean>(false)
  const [isSignatureSet, setIsSignatureSet] = useState<boolean>(false)

  useEffect(() => {
    messageDomain.onLoginStatusChanged(() => {
      setIsEncryptionPublicKeySet(messageDomain.isEncryptionPublicKeySet())
      setIsSignatureSet(messageDomain.isSignatureSet())
    })
  }, [])

  if (isSignatureSet) {
    return renderCeckRenderWithDefaultWrapper(
      <TextWithSpinner text="Registering account on chain..." />
    )
  }

  if (isEncryptionPublicKeySet) {
    return renderCeckRenderWithDefaultWrapper(
      <TextWithSpinner text="Creating account..." />
    )
  }

  if (isRegistering) {
    return renderCeckRenderWithDefaultWrapper(
      <TextWithSpinner text="Signing..." />
    )
  }

  return (
    <div
      className={classNames(
        'w-full h-full flex flex-col justify-between overflow-auto'
      )}
    >
      <div className={classNames('flex-auto flex flex-col justify-evenly')}>
        <div className={classNames('flex flex-col items-center')}>
          <img src={TanglePayLogoSVG} className={classNames('w-32 h-32')} />
          <div className={classNames('text-center')}>
            <div className={classNames('font-bold text-primary text-2xl')}>
              GroupFi Chatbox
            </div>
            <div className={classNames('pt-2 text-primary text-sm')}>
              Decentralized Chat, Unified Community
            </div>
          </div>
        </div>
        <div className={classNames('px-5')}>
          <button
            className={classNames('w-full h-12 bg-[#3671EE] rounded-xl')}
            onClick={() => {
              messageDomain.registerPairX()
              setIsRegistering(true)
            }}
          >
            <span className={classNames('text-white')}>Create Account</span>
          </button>
          <div className={classNames('py-3 px-5 text-[#3671EE] text-center')}>
            <button
              onClick={() => {
                messageDomain.setUserBrowseMode(true)
              }}
            >
              Browse as a guest
            </button>
          </div>
        </div>
      </div>
      <Powered />
    </div>
  )
}
