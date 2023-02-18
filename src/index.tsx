import React, { CSSProperties, useEffect, useState } from "react";
import {
  Button,
  Chip,
  Typography,
  Box,
  Grid,
  Toolbar,
  Card,
  CardContent,
  IconButton,
  SxProps,
} from "@mui/material";
import "./style.css";
import { common_java, full_data } from "./data_full";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const STORAGE_KEY = "previous_phonetic_input";
export interface BtnInputProps {
  character: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  sx: SxProps;
}
const BtnInput = ({ character, onClick, sx }: BtnInputProps) => (
  <Chip
    onClick={onClick}
    sx={{
      ...sx,
      m: 1,
      pt: 0.8,
      pb: 0.8,
      pl: 0.6,
      pr: 0.6,
      fontSize: "1.3rem",
    }}
    label={
      <TextToPhonetic
        style={{
          fontSize: "1.3rem",
        }}
      >
        {character == " " ? "space" : character}
      </TextToPhonetic>
    }
  />
);

const PreviousData = ({
  addValue,
  sx,
}: {
  addValue: (newValue: string) => void;
  sx: SxProps;
}) => {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistoryStr = localStorage.getItem(STORAGE_KEY);

      if (storedHistoryStr !== null) {
        const storedHistory: string[] = JSON.parse(storedHistoryStr);
        setData(storedHistory);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      {data.map((item, idx) => (
        <BtnInput
          key={idx}
          sx={sx}
          character={item}
          onClick={async () => {
            remember(item);
            addValue(item);
          }}
        />
      ))}
    </>
  );
};

function remember(text: string) {
  try {
    const beforeStr = localStorage.getItem(STORAGE_KEY);
    let before: string[] = [];

    if (beforeStr !== null) {
      before = JSON.parse(beforeStr);

      if (!before.includes(text)) {
        before.unshift(text);
      }

      if (before.length > 20) {
        before.pop();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(before));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([text]));
    }
  } catch (error) {
    console.log(error);
  }
}

export function TextToPhonetic({
  children,
  style,
}: {
  children: string;
  style?: CSSProperties;
}) {
  return (
    <span className="fonetis" style={style}>
      {children}
    </span>
  );
}
type InputPhoneticProps = {
  addValue: (newValue: string) => void;
  useRemember?: boolean;
  dataDefault?: string[];
  height?: string;
  sx: SxProps;
  buttonSx: SxProps;
};
export function InputPhonetic({
  addValue,
  useRemember = true,
  dataDefault = common_java,
  height = "300px",
  sx = {},
  buttonSx,
}: InputPhoneticProps) {
  const sxDefault = {
    maxWidth: "500px",
  };

  const [data, setData] = useState<
    | string[]
    | {
        label: string;
        data: string;
      }[]
  >(dataDefault);
  const [more, setMore] = useState(false);

  //https://ipa.typeit.org/full/

  return (
    <Box sx={{ ...sx, ...sxDefault }}>
      <Toolbar sx={{ padding: "0px!important", overflow: "auto" }}>
        <Button
          onClick={() => {
            if (more) {
              setData(dataDefault);
              setMore(false);
            } else {
              setData(full_data);
              setMore(true);
            }
          }}
          size="small"
          color="inherit"
          startIcon={more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {more ? "Less" : "More"}
        </Button>
        {useRemember && <PreviousData sx={buttonSx} addValue={addValue} />}
      </Toolbar>

      <Card
        sx={{
          ...sx,
          ...sxDefault,
          overflowY: "scroll",
          height: height,
        }}
      >
        <CardContent>
          {more && (
            <Typography variant="body1" gutterBottom>
              You can scroll down
            </Typography>
          )}

          {data.map((item, idx) => {
            if (typeof item == "string") {
              return (
                <BtnInput
                  key={idx}
                  sx={buttonSx}
                  character={item}
                  onClick={async () => {
                    if (useRemember) {
                      remember(item);
                    }
                    addValue(item);
                  }}
                />
              );
            } else {
              return (
                <div key={idx}>
                  <Typography variant="body1" gutterBottom>
                    {item.label}
                  </Typography>
                  {item.data.split("").map((itemChild, index) => (
                    <BtnInput
                      key={index}
                      sx={buttonSx}
                      character={itemChild}
                      onClick={async () => {
                        if (useRemember) {
                          remember(itemChild);
                        }
                        addValue(itemChild);
                      }}
                    />
                  ))}
                </div>
              );
            }
          })}
        </CardContent>
      </Card>
    </Box>
  );
}

export default { TextToPhonetic, InputPhonetic };
