export const LightTheme = {
    text: {
      primary: '#111827',
      secondary: '#687076',
      link: '#42aaf5',
    },
    background: {
      primary: '#fbfcfd',
      secondary: '#fff',
      tinted: 'rgba(0, 0, 0, 0.5)',
    },
    border: {
      default: '#CFCFCF',
      popup: 'white',
    },
    button: {
      primary: {
        border: '#D0C597',
        text: 'black',
        background: '#D0C597',
        depressed: '#C0B78E'
      },
      secondary: {
        background: '#fff',
        border: '#B5B3B3',
        text: '#111827',
        depressed: '#D1D1D1',
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
          border: '#D0C597',
          background: 'rgba(208, 197, 151, 0.5)',
          radio: '#1E1F20',
          text: 'black',
        },
      },
    },
    input: {
      background: '#f1f2f3',
      border: '#D1D1D1',
      text: '#111827',
      invalid: {
        border: '#CE7070',
        focusedBorder: '#F86868',
        text: '#FF3D3D',
        background: '#F5D3D3',
      },
      focused: {
        background: 'rgba(191,209,123,0.2)',
        border: '#ACCD30',
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
      background: '#659B0D', // TODO FIND A DIFFERENT COLOR FOR THIS, ESPECIALLY FOR THE PUTTING GREEN AS IT DOESNT CONTRAST WELL
      color: 'white',
      bare: {
        color: '#D9D9D9',
        background: '#fff'
      }
    },
  };

export const DarkTheme = {
    text: {
      primary: '#fff',
      secondary: '#9ba1a6',
      link: '#42aaf5',
    },
    background: {
      primary: '#161718',
      secondary: '#1E1F20',
      tinted: 'rgba(0, 0, 0, 0.8)',
    },
    border: {
      default: '#484A4B',
      popup: '#484A4B',
    },
    button: {
      primary: {
        border: '#B8B08D',
        text: 'black',
        background: '#B8B08D',
        depressed: '#908A70',
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
          border: '#B8B08D',
          background: '#B8B08D',
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
        background: 'rgba(191,209,123,0.2)',
        border: '#677943'
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
  };