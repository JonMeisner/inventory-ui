import Apis from "../../apis/inventory-apis";
import { showErrorMessage } from "../snackbar/snackbar.actions";
import { weaponReset } from "../../helpers/weapons";

export const LOAD_INVENTORY = "LOAD_INVENTORY";
export const QUICK_UPDATE_INVENTORY = "QUICK_UPDATE_INVENTORY";
export const SHOW_INVENTORY = "SHOW_INVENTORY";
export const CLOSE_INVENTORY = "CLOSE_INVENTORY";
export const LOAD_OTHER_INVENTORY = "LOAD_OTHER_INVENTORY";
export const LOAD_OTHER_PLAYER_INVENTORY = "LOAD_OTHER_PLAYER_INVENTORY";

export const SELECT_INVENTORY_ITEM = "SELECT_INVENTORY_ITEM";
export const SELECT_INVENTORY_ITEM_INDEX = "SELECT_INVENTORY_ITEM_INDEX";
export const MOVE_INVENTORY_ITEM = "MOVE_INVENTORY_ITEM";

export const DOUBLE_CLICK_SWAP = "DOUBLE_CLICK_SWAP";

export const USE_ITEM_HANDLER = "USE_ITEM_HANDLER";
export const USE_INVENTORY_ITEM = "USE_INVENTORY_ITEM";
export const HIDE_USE_INVENTORY_ITEM = "HIDE_USE_INVENTORY_ITEM";
export const USE_ITEM_SLOT_TWO = "USE_ITEM_SLOT_TWO";
export const USE_ITEM_SLOT_THREE = "USE_ITEM_SLOT_THREE";
export const USE_ITEM_SLOT_FOUR = "USE_ITEM_SLOT_FOUR";
export const USE_ITEM_SLOT_FIVE = "USE_ITEM_SLOT_FIVE";

export const UPDATE_WEAPON_INFO = "UPDATE_WEAPON_INFO";
export const UPDATE_ITEM_INFO = "UPDATE_ITEM_INFO";

export const BUY_STORE_ITEMS = "BUY_STORE_ITEMS";

// Belongs to Confirmation Box
export const CLOSE_CONFIRMATION = "CLOSE_CONFIRMATION";
export const STORE_CONFIRMATION = "STORE_CONFIRMATION";
export const UPDATE_QUANTITY_STORE = "UPDATE_QUANTITY_STORE";
export const ADD_ITEM_STORE = "ADD_ITEM_STORE";
export const SUBTRACT_ITEM_STORE = "SUBTRACT_ITEM_STORE";
export const UPDATE_QUANTITY_CONTEXT = "UPDATE_QUANTITY_CONTEXT";
export const ADD_ITEM_CONTEXT = "ADD_ITEM_CONTEXT";
export const SUBTRACT_ITEM_CONTEXT = "SUBTRACT_ITEM_CONTEXT";

export const STORE_CONFIRMATION_HANDLER = "STORE_CONFIRMATION_HANDLER";
export const SHOW_SPLIT_CONFIRMATION = "SHOW_SPLIT_CONFIRMATION";

export const OPEN_CONTEXT_MENU = "OPEN_CONTEXT_MENU";
export const CLOSE_CONTEXT_MENU = "CLOSE_CONTEXT_MENU";

export const DROP_ITEM_HANDLER = "DROP_ITEM_HANDLER";
export const GIVE_ITEM_HANDLER = "GIVE_ITEM_HANDLER";
export const GIVE_ITEM_SUCCESS = "GIVE_ITEM_SUCCESS";
export const SPLIT_ITEM_HANDLER = "SPLIT_ITEM_HANDLER";
export const SPLIT_OTHER_ITEM_HANDLER = "SPLIT_OTHER_ITEM_HANDLER";

export const REMOVED_SELECTED_ITEM = "REMOVED_SELECTED_ITEM";

export const LOAD_STORAGE = "LOAD_STORAGE";

export const UPDATE_WEAPON_CLIP = "UPDATE_WEAPON_CLIP";

export const loadInventory = (data) => {
    return (dispatch) => {
        dispatch({
            type: LOAD_INVENTORY,
            payload: data,
        });

        dispatch(showInventory());
    };
};

export const updateInventory = (data) => {
    return (dispatch) => {
        dispatch({
            type: LOAD_INVENTORY,
            payload: data,
        });
    };
};

export const showInventory = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_INVENTORY,
        });
    };
};

export const closeInventory = (
    personalInventory,
    otherInventory,
    info,
    inventoryType
) => {
    return (dispatch) => {
        Apis.closeInventory({
            personalInventory,
            otherInventory,
            info,
            inventoryType,
        }).then((res) => {
            if (res.data === "true") {
                dispatch({
                    type: CLOSE_INVENTORY,
                });
            }
        });
    };
};

export const loadOtherInventory = (data) => {
    return (dispatch) => {
        dispatch({
            type: LOAD_OTHER_INVENTORY,
            payload: data,
        });
    };
};

export const selectInventoryItem = (payload) => ({
    type: SELECT_INVENTORY_ITEM,
    payload: payload,
});

export const removeSelectedItem = (payload) => ({
    type: REMOVED_SELECTED_ITEM,
});

export const useItemHandler = (contextItem, personalInventory) => {
    return (dispatch) => {
        contextItem.item.count = --contextItem.item.count;
        Apis.useItem(contextItem);
    };
};

export const moveInventoryItem = (
    item,
    personalInventory,
    otherInventory,
    selectedItem, //first item selected
    dropLocation,
    index, //drop location
    info
) => {
    return (dispatch) => {
        let inventories = {
            personalInventory: { ...personalInventory },
            otherInventory: { ...otherInventory },
            selectedItem: { ...selectedItem },
            info: { ...info },
            dropLocation: dropLocation,
            itemDropIndex: index,
        };

        if(selectedItem.data !== '{}'){

            //SWAPS BETWEEN PERSONAL INVENTORY
            if (selectedItem.type === "Personal" && dropLocation === "Personal") {
                //this is for item splits, and recombinding stacks, this makes it to where you cant stack a stack on a stack[dupe]
                if (
                    selectedItem.data.name ===
                        personalInventory.inventory[index].name &&
                    selectedItem.index !== index
                ) {
                    let moveToSlot = inventories.personalInventory.inventory.splice(
                        selectedItem.index,
                        1,
                        "{}"
                    );
                    if (moveToSlot[0].count) {
                        moveToSlot[0].count += item.count;
                        inventories.personalInventory.inventory.splice(
                            index,
                            1,
                            moveToSlot[0]
                        );
                    } else if (moveToSlot[0].money) {
                        moveToSlot[0].money += item.money;
                        inventories.personalInventory.inventory.splice(
                            index,
                            1,
                            moveToSlot[0]
                        );
                    }
                } else {
                    const moveToSlot = inventories.personalInventory.inventory.splice(
                        selectedItem.index,
                        1,
                        item
                    );
                    inventories.personalInventory.inventory.splice(
                        index,
                        1,
                        moveToSlot[0]
                    );
                }
            }
    
            //PUTS ITEMS INTO OTHER INVENTORY
            if (selectedItem.type === "Personal" && dropLocation !== "Personal") {
                let searchIndex = inventories.otherInventory.inventory.findIndex(
                    (item) => item.name === selectedItem.data.name
                );
    
                if (searchIndex === -1) {
                    searchIndex = index;
                }
    
                if (dropLocation === "Trunk") {
                    let trunkWeight = 0;
                    let maxWeight = info.other.max / 750;
    
                    if (inventories.otherInventory.inventory[index] !== "{}") {
                        return null;
                    }
    
                    if (selectedItem.data.type === "item_standard" || selectedItem.data.type === "item_food") {
                        trunkWeight =
                            selectedItem.data.count * selectedItem.data.weight;
                    } else if (selectedItem.data.type === "item_weapon") {
                        trunkWeight = trunkWeight + 1;
                    }
    
                    inventories.otherInventory.inventory.forEach((item) => {
                        if (item.count) {
                            trunkWeight += item.count * item.weight;
                        }
                    });
    
                    if (trunkWeight <= maxWeight) {
                        const moveToSlot = inventories.personalInventory.inventory.splice(
                            selectedItem.index,
                            1,
                            item
                        );
    
                        if (
                            searchIndex !== -1 &&
                            inventories.otherInventory.inventory[searchIndex] !==
                                "{}"
                        ) {
                            if (selectedItem.data.count) {
                                inventories.otherInventory.inventory[
                                    searchIndex
                                ].count =
                                    selectedItem.data.count +
                                    inventories.otherInventory.inventory[
                                        searchIndex
                                    ].count;
                            } else if (selectedItem.data.money) {
                                inventories.otherInventory.inventory[
                                    searchIndex
                                ].money =
                                    selectedItem.data.money +
                                    inventories.otherInventory.inventory[
                                        searchIndex
                                    ].money;
                            } else {
                                inventories.otherInventory.inventory.splice(
                                    index,
                                    1,
                                    moveToSlot[0]
                                );
                            }
                            inventories.personalInventory.inventory[
                                selectedItem.index
                            ] = "{}";
                        } else {
                            inventories.otherInventory.inventory.splice(
                                index,
                                1,
                                moveToSlot[0]
                            );
                        }
                    } else {
                        //if overweight do this
                        dispatch(showErrorMessage("Over capacity."));
                        return null;
                    }
                } else {
                    if (inventories.otherInventory.inventory[index] !== "{}") {
                        return null;
                    }
                    const moveToSlot = inventories.personalInventory.inventory.splice(
                        selectedItem.index,
                        1,
                        item
                    );
    
                    if (
                        searchIndex !== -1 &&
                        inventories.otherInventory.inventory[searchIndex] !== "{}"
                    ) {
                        if (selectedItem.data.count) {
                            inventories.otherInventory.inventory[
                                searchIndex
                            ].count =
                                selectedItem.data.count +
                                inventories.otherInventory.inventory[searchIndex]
                                    .count;
                        } else if (selectedItem.data.money) {
                            inventories.otherInventory.inventory[
                                searchIndex
                            ].money =
                                selectedItem.data.money +
                                inventories.otherInventory.inventory[searchIndex]
                                    .money;
                        } else {
                            inventories.otherInventory.inventory.splice(
                                index,
                                1,
                                moveToSlot[0]
                            );
                        }
                        inventories.personalInventory.inventory[
                            selectedItem.index
                        ] = "{}";
                    } else {
                        inventories.otherInventory.inventory.splice(
                            index,
                            1,
                            moveToSlot[0]
                        );
                    }
                }
            }
    
            //SWAPS BETWEEN PERSONAL AND PLAYER TO PREVENT DUPING, THIS NEEDS TO REMAIN BEFORE OTHERS
            if (selectedItem.type === "Player" && dropLocation === "Player") {
                return null;
            }
    
            if (selectedItem.type !== "Personal" && dropLocation !== "Personal") {
                const moveToSlot = inventories.otherInventory.inventory.splice(
                    selectedItem.index,
                    1,
                    item
                );
    
                inventories.otherInventory.inventory.splice(
                    index,
                    1,
                    moveToSlot[0]
                );
            }
    
            //GETS ITEM FROM OTHER INVENTORY
            if (selectedItem.type !== "Personal" && dropLocation === "Personal") {
                let maxWeight = info.personal.maxWeight;
                let weight = info.personal.weight;
    
                if (selectedItem.data.count) {
                    weight = selectedItem.data.count + weight;
                }
    
                if (inventories.personalInventory.inventory[index] !== "{}") {
                    return null;
                }
    
                if (checkWeight(weight, maxWeight)) {
                    //DEALING WITH SPLITS [GETS]
                    const searchIndex = inventories.personalInventory.inventory.findIndex(
                        (item) => item.name === selectedItem.data.name
                    );
                    if (
                        inventories.personalInventory.inventory[searchIndex] &&
                        inventories.personalInventory.inventory[searchIndex]
                            .type === "item_weapon"
                    ) {
                        return dispatch(
                            showErrorMessage("You already have this weapon.")
                        );
                    }
                    const moveToSlot = inventories.otherInventory.inventory.splice(
                        selectedItem.index,
                        1,
                        item
                    );
                    if (searchIndex !== -1) {
                        if (selectedItem.data.count) {
                            inventories.personalInventory.inventory[
                                searchIndex
                            ].count =
                                selectedItem.data.count +
                                inventories.personalInventory.inventory[searchIndex]
                                    .count;
                        } else if (selectedItem.data.money) {
                            inventories.personalInventory.inventory[
                                searchIndex
                            ].money =
                                selectedItem.data.money +
                                inventories.personalInventory.inventory[searchIndex]
                                    .money;
                        } else {
                            inventories.otherInventory.inventory.splice(
                                index,
                                1,
                                moveToSlot[0]
                            );
                        }
                        inventories.otherInventory.inventory[selectedItem.index] =
                            "{}";
                    } else {
                        inventories.personalInventory.inventory.splice(
                            index,
                            1,
                            moveToSlot[0]
                        );
                    }
                } else {
                    //if overweight do this
                    dispatch(showErrorMessage("Over capacity."));
                    return null;
                }
            }
    
            dispatch({ type: MOVE_INVENTORY_ITEM, payload: inventories });
            Apis.updateInventory(inventories);
        }
    };
};

const checkWeight = (weight, maxWeight) => {
    if (weight <= maxWeight) {
        return true;
    } else {
        return false;
    }
};

export const useInventoryItem = (itemIndex) => {
    return (dispatch) => {
        dispatch({
            type: USE_INVENTORY_ITEM,
            payload: itemIndex,
        });

        setTimeout(() => dispatch(hideUseInventoryItem()), 500);
    };
};

export const hideUseInventoryItem = () => ({
    type: HIDE_USE_INVENTORY_ITEM,
});

export const updateWeapon = (weaponData) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_WEAPON_INFO,
            payload: weaponData,
        });
    };
};

export const updateItem = (itemData) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_ITEM_INFO,
            payload: itemData,
        });
    };
};

export const closeConfirmation = () => {
    return (dispatch) => {
        dispatch({
            type: CLOSE_CONFIRMATION,
        });
    };
};

export const storeConfirmation = (selectedItem) => {
    return (dispatch) => {
        dispatch({
            type: STORE_CONFIRMATION,
            payload: selectedItem,
        });
    };
};

export const addItemStore = () => {
    return (dispatch) => {
        dispatch({
            type: ADD_ITEM_STORE,
        });
    };
};

export const subtractItemStore = () => {
    return (dispatch) => {
        dispatch({
            type: SUBTRACT_ITEM_STORE,
        });
    };
};

export const updateQuantityStore = (quantity, storeItem, boughtItem) => {
    return (dispatch) => {
        const regExp = /^\d+$/;
        if (regExp.test(quantity) || quantity === "") {
            let item = { ...storeItem };
            if (item.price === 0) {
                item.price = boughtItem.price;
                item.price = item.price * quantity;
            }
            if (quantity === "") {
                quantity = 0;
                item.price = 0;
            } else {
                item.price = boughtItem.price * quantity;
            }

            dispatch({
                type: UPDATE_QUANTITY_STORE,
                payload: { quantity, item },
            });
        }
    };
};

export const addItemContext = () => {
    return (dispatch) => {
        dispatch({
            type: ADD_ITEM_CONTEXT,
        });
    };
};

export const subtractItemContext = () => {
    return (dispatch) => {
        dispatch({
            type: SUBTRACT_ITEM_CONTEXT,
        });
    };
};

export const updateQuantityContext = (quantity) => {
    return (dispatch) => {
        const regExp = /^\d+$/;
        if (regExp.test(parseInt(quantity)) || quantity === "") {
            const value = parseInt(quantity);
            dispatch({
                type: UPDATE_QUANTITY_CONTEXT,
                payload: value,
            });
        }
    };
};

export const storeConfirmationHandler = (
    personalInventory,
    otherInventory,
    selectedItem,
    quantity,
    info,
    boughtItem
) => {
    return async (dispatch) => {
        let inventory = [...personalInventory.inventory];
        let updated = {};
        if (otherInventory.inventory.length !== 0) {
            if (otherInventory.title !== "Gun Store") {
                if (selectedItem && quantity) {
                    const weight = info.personal.weight + parseInt(quantity);
                    if (info.personal.maxWeight < weight) {
                        dispatch(showErrorMessage("Over capacity."));
                        return;
                    }
                }

                const itemIndex = inventory.findIndex((item) => {
                    if (item !== "{}") {
                        return (
                            item.name.toLowerCase() ===
                            selectedItem.data.name.toLowerCase()
                        );
                    }
                });
                const bracketIndex = inventory.findIndex(
                    (item) => item === "{}"
                );
                const moneyIndex = inventory.findIndex(
                    (item) => item.name === "money"
                );

                if (itemIndex > 0) {
                    inventory[itemIndex].price =
                        inventory[itemIndex].count * selectedItem.data.price;
                    inventory[itemIndex].count =
                        inventory[itemIndex].count + parseInt(quantity);
                }
                inventory[moneyIndex].money =
                    inventory[moneyIndex].money -
                    selectedItem.data.price * quantity;

                if (bracketIndex && itemIndex < 0) {
                    inventory[bracketIndex] = {};
                    inventory[bracketIndex].name = selectedItem.data.name;
                    inventory[bracketIndex].count = parseInt(quantity);
                    inventory[bracketIndex].type = selectedItem.data.type;
                    inventory[bracketIndex].label = selectedItem.data.label;
                }

                // if (otherInventory.type === "Store") {
                //     selectedItem.data.type = "item_standard";
                // }

                updated = {
                    inventory,
                    otherInventory,
                    selectedItem,
                    quantity,
                    info,
                    boughtItem,
                };
            } else {
                if (selectedItem && quantity) {
                    const weight = info.personal.weight + 1;
                    if (info.personal.maxWeight < weight) {
                        dispatch(showErrorMessage("Over capacity."));
                        return;
                    }
                }

                const itemIndex = inventory.findIndex((item) => {
                    if (item !== "{}") {
                        return (
                            item.name.toLowerCase() ===
                            selectedItem.data.name.toLowerCase()
                        );
                    }
                });
                const bracketIndex = inventory.findIndex(
                    (item) => item === "{}"
                );
                const moneyIndex = inventory.findIndex(
                    (item) => item.name === "money"
                );

                if (itemIndex > 0 && selectedItem.data.name !== "clip") {
                    dispatch(showErrorMessage("You already have this weapon."));
                    return;
                }

                inventory[moneyIndex].money =
                    inventory[moneyIndex].money - selectedItem.data.price;

                if (bracketIndex && itemIndex < 0) {
                    const weapon = weaponReset(selectedItem.data);
                    inventory[bracketIndex] = {};
                    inventory[bracketIndex].name = weapon.name;
                    inventory[bracketIndex].label = weapon.label;
                    inventory[bracketIndex].ammo = weapon.ammo;
                    inventory[bracketIndex].type = "item_weapon";
                }

                updated = {
                    inventory,
                    otherInventory,
                    selectedItem,
                    quantity,
                    info,
                    boughtItem,
                };
            }

            Apis.buyItem(updated);
            dispatch({
                type: STORE_CONFIRMATION_HANDLER,
                payload: updated,
            });
        }
    };
};

export const openContextMenu = (data) => {
    return (dispatch) => {
        dispatch({ type: OPEN_CONTEXT_MENU, payload: data });
    };
};

export const closeContextMenu = () => {
    return (dispatch) => {
        dispatch({ type: CLOSE_CONTEXT_MENU });
    };
};

export const showSplitConfirmation = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_SPLIT_CONFIRMATION,
        });
    };
};

export const dropItemHandler = (contextItem, personalInventory, playerInfo) => {
    // Apis.dropItem(contextItem);
    return (dispatch) => {
        Apis.dropItem(contextItem, personalInventory)
            .then((res) => {
                if (res.data === "true") {
                    if (personalInventory[contextItem.index].count) {
                        playerInfo.weight -=
                            personalInventory[contextItem.index].count;
                    }
                    personalInventory[contextItem.index] = "{}";
                    const data = {
                        personalInventory,
                        playerInfo,
                    };
                    dispatch({ type: DROP_ITEM_HANDLER, payload: data });
                } else {
                    console.log("Error");
                }
            })
            .catch((error) => console.log(error));
    };
};

export const giveItemSuccess = (contextItem, personalInventory, playerInfo) => {
    return (dispatch) => {
        if (personalInventory[contextItem.index].count) {
            playerInfo.weight =
                playerInfo.weight - personalInventory[contextItem.index].count;
        }
        personalInventory[contextItem.index] = "{}";
        const data = {
            personalInventory,
            playerInfo,
        };

        Apis.giveItemsFromSort(personalInventory);
        dispatch({ type: GIVE_ITEM_SUCCESS, payload: data });
    };
};

export const giveItemFailure = () => {};

export const giveItemHandler = (contextItem, personalInventory, playerInfo) => {
    return (dispatch) => {
        Apis.givePlayerItem(contextItem, personalInventory)
            .then((res) => {
                if (res.data === "true") {
                    dispatch(
                        giveItemSuccess(
                            contextItem,
                            personalInventory,
                            playerInfo
                        )
                    );
                } else {
                    console.log("Error");
                }
            })
            .catch((error) => console.log(error));
    };
};

const returnUpdatedArray = (splitContext, data, inventoryString) => {
    if (splitContext.item.count) {
        if (
            splitContext.item.count <= data.quantity ||
            data.quantity === null
        ) {
            return;
        }
        data[inventoryString].inventory[splitContext.index].count =
            data[inventoryString].inventory[splitContext.index].count -
            data.quantity;
    }

    if (splitContext.item.money) {
        if (splitContext.item.money <= data.quantity) {
            return;
        }
        data[inventoryString].inventory[splitContext.index].money =
            data[inventoryString].inventory[splitContext.index].money -
            data.quantity;
    }
    return data;
};

const handleUpdateOfSplit = (data, splitItem, inventoryString) => {
    return (dispatch) => {
        if (data.quantity > 0) {
            const newLocation = data[inventoryString].inventory.findIndex(
                (item) => item === "{}"
            );
            let copyItem = { ...splitItem };
            if (newLocation !== -1) {
                if (
                    copyItem.type === "item_standard" ||
                    copyItem.type === "item_food"
                ) {
                    copyItem.count = parseInt(data.quantity);
                } else {
                    copyItem.money = parseInt(data.quantity);
                }

                data[inventoryString].inventory[newLocation] = copyItem;
                if (inventoryString === "personalInventory") {
                    dispatch({
                        type: SPLIT_ITEM_HANDLER,
                        payload: data[inventoryString].inventory,
                    });
                } else {
                    dispatch({
                        type: SPLIT_OTHER_ITEM_HANDLER,
                        payload: data[inventoryString].inventory,
                    });
                }
                Apis.updateInventory(data);
            }
            dispatch(closeConfirmation());
        }
    };
};

export const splitItemHandler = (data) => {
    return (dispatch) => {
        if (data.contextItem.type === "Personal") {
            let splitContext = { ...data.contextItem };
            data = returnUpdatedArray(splitContext, data, "personalInventory");

            dispatch(
                handleUpdateOfSplit(
                    data,
                    splitContext.item,
                    "personalInventory"
                )
            );
        } else {
            let splitContext = { ...data.contextItem };
            data = returnUpdatedArray(splitContext, data, "otherInventory");

            dispatch(
                handleUpdateOfSplit(data, splitContext.item, "otherInventory")
            );
        }
    };
};

export const loadOtherPlayerInventory = (data) => {
    return (dispatch) => {
        dispatch({
            type: LOAD_OTHER_PLAYER_INVENTORY,
            payload: data,
        });
    };
};

export const loadStorage = (data) => {
    return (dispatch) => {
        // if (
        //     data.inventory.length !== 15 &&
        //     data.inventoryType !== "Motels"
        // ) {
        //     while (
        //         data.inventory.length !== 15 &&
        //         data.inventory.length <= 15
        //     ) {
        //         data.inventory.push("{}");
        //     }
        // }

        // if (
        //     data.inventory.length !== 50 &&
        //     data.inventoryType !== "Store" &&
        //     data.title !== "Evidence Locker"
        // ) {
        //     while (
        //         data.inventory.length !== 50 &&
        //         data.inventory.length <= 50
        //     ) {
        //         data.inventory.push("{}");
        //     }
        // }

        // if (data.title === "Evidence Locker") {
        while (data.inventory.length <= data.inventorySize - 1) {
            data.inventory.push("{}");
        }

        while (data.inventory.length > data.inventorySize) {
            data.inventory.pop();
        }
        // }

        dispatch({
            type: LOAD_STORAGE,
            payload: data,
        });
    };
};

export const updateWeaponClip = (data) => {
    return (dispatch) => {
        dispatch({ type: UPDATE_WEAPON_CLIP, payload: data });
    };
};



export const doubleClickSwap = (personalInventory, otherInventory, index, type) => {
    return (dispatch) => {
        if(type === "Personal"){
            const item = personalInventory.inventory[index]
            const freeLocation = otherInventory.inventory.indexOf("{}")
            
            personalInventory.inventory[index] = "{}"
            otherInventory.inventory[freeLocation] = item
        } else {
            const item = otherInventory.inventory[index]
            const freeLocation = personalInventory.inventory.indexOf("{}")
            
            otherInventory.inventory[index] = "{}"
            personalInventory.inventory[freeLocation] = item
        }
        dispatch({ type: DOUBLE_CLICK_SWAP, payload: data });
    }
}