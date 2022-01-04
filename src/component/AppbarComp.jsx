import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ColorModeContext from "../context/ColorModeContext";

export default function AppbarComp() {
	const theme = useTheme();
	const colorMode = React.useContext(ColorModeContext);

	return (
		<Box>
			<AppBar position="static">
				<Toolbar
					variant="dense"
					sx={{ display: "flex", justifyContent: "space-between" }}
				>
					<Typography variant="h6" color="inherit" component="div">
						RT Video Chat App
					</Typography>
					<Box>
						<IconButton
							sx={{ ml: 1 }}
							onClick={colorMode.toggleColorMode}
							color="inherit"
						>
							{theme.palette.mode === "dark" ? (
								<Brightness7Icon />
							) : (
								<Brightness4Icon />
							)}
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
