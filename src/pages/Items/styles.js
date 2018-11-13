const styles = theme => ({
  root: {
    flexGrow: 1,
    background: theme.palette.secondary.main,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing.unit * 8
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing.unit * 8
    }
  }
})

export default styles
