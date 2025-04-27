// Dependencies
import React from "react"
// Components
import { Menu, MenuItem } from "@/components/figma/Menu"
import { Heading } from "@/components/layout"
import useModal from "@/hooks/useModal"

export default function Title() {
   const { display: isMenu, setDisplay: setIsMenu, modalRef: menuRef, actionRef: menuBtnRef } = useModal()

   return (
      <section>
         <Heading
            buttons={[
               {
                  ref: menuBtnRef,
                  icon: "ellipses",
                  onClick: () => setIsMenu(!isMenu),
                  tooltip: { text: "Plugin menu", conditional: !isMenu },
               },
            ]}
            className="pos-relative"
         >
            <h3 className={`fs-14px fw-550`}>Properties Panel</h3>
            <Menu ref={menuRef} className="mnw-170px" isOpen={isMenu}>
               <MenuItem title="Add Gradient" />
               <hr />
               <MenuItem title="Add Gradient" command="Ctrl+K" />
               <MenuItem title="Add Gradient" command="Ctrl+K" />
            </Menu>
         </Heading>
      </section>
   )
}
