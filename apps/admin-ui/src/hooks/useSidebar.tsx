import { useAtom } from 'jotai'
import React from 'react'
import { activeSideBarItem } from '../configs/constants'

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem)

  return { activeSidebar, setActiveSidebar }
}

export default useSidebar
