import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    Slide,
    TextField,
    Typography,
} from "@material-ui/core";
import { Add, Remove } from "@material-ui/icons";
import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addItemContext,
    addItemStore,
    subtractItemContext,
    subtractItemStore,
    updateQuantityContext,
    updateQuantityStore,
} from "../store/inventory/inventory.actions";

const useStyles = makeStyles((theme) => ({
    paper: {
        overflowY: "unset",
        backgroundColor: "#212121",
        color: "#fff",

        "& .MuiInputBase-root": {
            color: "#fff",
        },
    },
    button: {
        border: "none",
        color: "#fff",
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const RenderShopConfirmation = ({
    quantity,
    confirmation,
    inventory,
    storeItem,
    boughtItem,
    selectedItem,
    agreeHandler,
    disagreeHandler,
    dispatch,
}) => {
    const classes = useStyles();
    return (
        <Dialog
            open={confirmation.show}
            TransitionComponent={Transition}
            keepMounted
            classes={{ paper: classes.paper }}
        >
            <DialogTitle>{confirmation.title}</DialogTitle>
            <DialogContent>
                {storeItem ? (
                    <Typography>Cost: {storeItem.price} </Typography>
                ) : (
                    <Fragment />
                )}

                <TextField
                    autoFocus
                    className="MuiInputBase-root"
                    value={quantity ? quantity : null}
                    onChange={(e) =>
                        dispatch(
                            updateQuantityStore(
                                e.target.value,
                                storeItem,
                                boughtItem
                            )
                        )
                    }
                    variant="outlined"
                    size="small"
                />
                <IconButton
                    classes={{ root: classes.button }}
                    onClick={() => dispatch(addItemStore())}
                >
                    <Add />
                </IconButton>
                <IconButton
                    classes={{ root: classes.button }}
                    onClick={() =>
                        dispatch(
                            subtractItemStore(
                                inventory,
                                storeItem,
                                selectedItem
                            )
                        )
                    }
                >
                    <Remove />
                </IconButton>
            </DialogContent>
            <DialogActions>
                {quantity > 0 ? (
                    <Button
                        classes={{ root: classes.button }}
                        onClick={agreeHandler}
                    >
                        Agree
                    </Button>
                ) : (
                    <Fragment />
                )}
                <Button
                    classes={{ root: classes.button }}
                    onClick={disagreeHandler}
                >
                    Disagree
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const RenderContextConfirmation = ({
    quantity,
    confirmation,
    closeHandler,
    agreeHandler,
    disagreeHandler,
    dispatch,
}) => {
    const inputRef = useRef();
    const classes = useStyles();

    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRef.current.focus();
        }, 100);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <Dialog
            open={confirmation.show}
            onClose={closeHandler}
            TransitionComponent={Transition}
            keepMounted
            classes={{ paper: classes.paper }}
        >
            <DialogTitle>{confirmation.title}</DialogTitle>
            <DialogContent>
                <TextField
                    inputRef={inputRef}
                    className="MuiInputBase-root"
                    value={quantity ? quantity : null}
                    onChange={(e) =>
                        dispatch(updateQuantityContext(e.target.value))
                    }
                    variant="outlined"
                    size="small"
                />
                <IconButton
                    classes={{ root: classes.button }}
                    onClick={() => dispatch(addItemContext())}
                >
                    <Add />
                </IconButton>
                <IconButton
                    classes={{ root: classes.button }}
                    onClick={() => dispatch(subtractItemContext())}
                >
                    <Remove />
                </IconButton>
            </DialogContent>
            <DialogActions>
                {quantity > 0 ? (
                    <Button
                        classes={{ root: classes.button }}
                        onClick={agreeHandler}
                    >
                        Agree
                    </Button>
                ) : (
                    <Fragment />
                )}
                <Button
                    classes={{ root: classes.button }}
                    onClick={disagreeHandler}
                >
                    Disagree
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ({ agreeHandler, disagreeHandler }) => {
    const dispatch = useDispatch();
    const quantity = useSelector((state) => state.inventory.quantity);
    const confirmation = useSelector((state) => state.inventory.confirmation);
    const inventory = useSelector(
        (state) => state.inventory.personalInventory.inventory
    );
    const boughtItem = useSelector((state) => state.inventory.boughtItem);
    const storeItem = useSelector((state) => state.inventory.storeItem);
    const selectedItem = useSelector((state) => state.inventory.selectedItem);
    const closeHandler = () => {
        // dispatch(inventoryActions.closeConfirmationHandler());
    };

    const renderConfirmationView = () => {
        if (confirmation.type === "Store") {
            return (
                <RenderShopConfirmation
                    quantity={quantity}
                    confirmation={confirmation}
                    inventory={inventory}
                    storeItem={storeItem}
                    boughtItem={boughtItem}
                    selectedItem={selectedItem}
                    closeHandler={closeHandler}
                    agreeHandler={agreeHandler}
                    disagreeHandler={disagreeHandler}
                    dispatch={dispatch}
                />
            );
        }

        if (confirmation.type !== "Store") {
            return (
                <RenderContextConfirmation
                    quantity={quantity}
                    confirmation={confirmation}
                    inventory={inventory}
                    selectedItem={selectedItem}
                    closeHandler={closeHandler}
                    agreeHandler={agreeHandler}
                    disagreeHandler={disagreeHandler}
                    dispatch={dispatch}
                />
            );
        }
    };

    return <Fragment>{renderConfirmationView()}</Fragment>;
};
