import React from "react";
import ToggleMode from "./component/ToggleMode";
import AppbarComp from "./component/AppbarComp";
import { Box } from "@mui/material";
import Main from "./component/Main";

function App() {
	return (
		<ToggleMode>
			<Box
				sx={{
					width: "100%",
					height: "100vh",
					color: "text.primary",
					backgroundColor: "background.default",
				}}
			>
				<AppbarComp />
				<Main />
			</Box>
		</ToggleMode>
	);
}

export default App;
