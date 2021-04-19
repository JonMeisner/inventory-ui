export const SHOW_HOVER_ITEM = "SHOW_HOVER_ITEM";
export const LEAVE_HOVER_ITEM = "LEAVE_HOVER_ITEM";

export const showHoverItem = (
    axis,
    i,
    personalInventory,
    otherInventory,
    inventoryType
) => {
    return (dispatch) => {
        let item;
        if (inventoryType === "Personal") {
            if (personalInventory.inventory[i] !== "{}") {
                item = personalInventory.inventory[i];
            }
        } else {
            if (personalInventory.inventory[i] !== "{}") {
                item = otherInventory[i];
            }
        }

        if (item !== undefined) {
            const data = {
                item: item,
                axis: axis,
            };
            dispatch({
                type: SHOW_HOVER_ITEM,
                payload: data,
            });
        } else {
            dispatch(leaveHoverItem());
        }
    };
};

export const leaveHoverItem = () => ({
    type: LEAVE_HOVER_ITEM,
});
