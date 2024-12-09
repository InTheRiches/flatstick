export const LightTheme = {
  text: {
    primary: '#111827',
    secondary: '#687076',
    link: '#42aaf5',
  },
  background: {
    primary: '#EDEDED',
    secondary: '#fff',
    tinted: 'rgba(0, 0, 0, 0.3)',
  },
  border: {
    default: '#CFCFCF',
    popup: 'white',
  },
  button: {
    primary: {
      border: '#CFCFCF',
      text: 'black',
      background: 'white',
      depressed: '#ededed'
    },
    secondary: {
      background: '#000',
      border: '#000',
      text: '#fff',
      depressed: '#1c1c1c',
    },
    disabled: {
      background: '#f1f2f3',
      border: '#D1D1D1',
      text: '#C4C4C4',
    },
    danger: {
      background: '#DC2626',
      border: '#DC2626',
      text: '#FFFFFF',
      depressed: '#e04343',
      disabled: {
        background: '#ffa3a3',
        border: '#FEE2E2',
        text: '#FFFFFF',
      },
    },
    radio: {
      border: '#CFCFCF',
      background: 'white',
      text: 'black',
      selected: {
        border: '#24b2ff', // TODO MAYBE MERGE THESE WITH TOGGLEABLES?
        background: '#d9f2ff',
        radio: '#1E1F20',
        text: 'black',
      },
    },
  },
  input: {
    background: 'white',
    border: '#bababa',
    text: '#111827',
    invalid: {
      border: '#CE7070',
      focusedBorder: '#F86868',
      text: '#FF3D3D',
      background: '#F5D3D3',
    },
    focused: {
      background: 'white',
      border: '#63B6FF',
    },
  },
  putting: {
    grid: {
      border: 'transparent',
      text: '#B2C490',
    },
    visual: {
      background: '#333D20',
      border: '#677943',
      text: '#111827',
      secondaryText: '#B2C490',
    },
  },
  checkmark: {
    background: '#40C2FF', // TODO FIND A DIFFERENT COLOR FOR THIS, ESPECIALLY FOR THE PUTTING GREEN AS IT DOESNT CONTRAST WELL
    color: 'white',
    bare: {
      color: '#D9D9D9',
      background: '#fff'
    }
  },
  stepMarker: {
    background: "#EDE7CE",
    text: "#B3A15D"
  },
  toggleable: {
    border: "#CFCFCF",
    background: "#fff",
    color: "#000",
    toggled: {
      border: "#24b2ff",
      background: "#d9f2ff",
      color: "#000",
    }
  }
};

export const DarkTheme = {
  text: {
    primary: '#fff',
    secondary: '#9ba1a6',
    link: '#42aaf5',
  },
  background: {
    primary: '#141414',
    secondary: '#2D2D2D',
    tinted: 'rgba(0, 0, 0, 0.8)',
  },
  border: {
    default: '#484A4B',
    popup: '#484A4B',
  },
  button: {
    primary: {
      border: 'transparent',
      text: 'black',
      background: 'white',
      depressed: '#C3C3C3',
    },
    secondary: {
      background: '#202425',
      border: '#424647',
      text: '#fff',
      depressed: '#323536',
    },
    disabled: {
      background: "#0c0d0e",
      border: "#2e2e2e",
      text: "#6b6e70"
    },
    danger: {
      background: '#C13838',
      border: '#C13838',
      text: '#E1E2E3',
      depressed: '#e04343',
      disabled: {
        background: '#751C21',
        border: '#751C21',
        text: '#E1E2E3',
      },
    },
    radio: {
      border: '#484A4B',
      background: '#1E1F20',
      text: 'white',
      selected: {
        border: 'white',
        background: '#333334',
        radio: '#CAC4AA',
        text: 'black',
      },
    },
  },
  input: {
    background: '#1E1F20',
    border: '#484A4B',
    text: '#fff',
    focused: {
      background: '#333334',
      border: 'white',
    },
    invalid: {
      border: '#943737',
      focusedBorder: '#dc2626',
      text: '#CF5151',
      background: 'rgba(255,74,74,0.15)',
    },
  },
  putting: {
    grid: {
      border: '#CEDD94',
      text: '#A5CA5F',
    },
    visual: {
      background: '#333D20',
      border: '#677943',
      text: '#fff',
      secondaryText: '#B2C490',
    },
  },
  checkmark: {
    background: '#333D20',
    color: 'white',
    bare: {
      color: '#D9D9D9',
      background: '#fff'
    }
  },
  stepMarker: {
    background: "#266623",
    text: "#99D384"
  },
  toggleable: {
    border: "#4D4D4D",
    background: "transparent",
    color: "#fff",
    toggled: {
      border: "#40C2FF",
      background: "#194064",
      color: "#fff",
    }
  }
};