import React, { Component, Fragment } from 'react'
import {
  TextField,
  Typography,
  withStyles,
  Button,
  Grid,
  Input
} from '@material-ui/core'
import ItemsContainer from '../../containers/ItemsContainer'
import CheckBoxItem from './CheckBoxItem'
import { Form, Field, FormSpy } from 'react-final-form'
import styles from './styles'
import { validate } from './helpers/validation'
import { getBase64Url } from './helpers/getBase64Url'
import { getAndSortTags } from './helpers/tagsHelper'
import { maxCharLength } from './helpers/charLength'
import { connect } from 'react-redux'
import { updateForm, resetImage, resetForm } from '../../redux/actions'
import Spinner from '../Spinner'
import PropTypes from 'prop-types'

class ShareForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      fileSelected: false,
      imageurl: '',
      done: false
    }
    this.fileRef = React.createRef()
  }
  componentWillUnmount = () => {
    this.props.resetForm()
  }
  handleImageReset = () => {
    this.setState({ fileSelected: false })
    this.fileRef.current.value = ''
    this.props.resetImage()
  }
  handleImageUploadSelect = () => {
    this.fileRef.current.click()
  }
  handleImageSelect = event => {
    this.setState({ fileSelected: event.target.files[0] })
  }
  dispatchUpdate(values, updateForm) {
    if (this.state.fileSelected) {
      getBase64Url(this.state.fileSelected).then(imageurl => {
        updateForm({
          imageurl
        })
      })
    }
    const tags = getAndSortTags(values.tags)
    updateForm({
      ...values,
      tags
    })
  }
  saveItem = async (values, addItem) => {
    const {
      validity,
      files: [file]
    } = this.fileRef.current
    if (!validity.valid || !file) return
    try {
      const tags = getAndSortTags(values.tags)
      const itemData = {
        ...values,
        tags
      }
      await addItem.mutation({
        variables: {
          item: itemData,
          image: file
        }
      })
      this.props.resetForm()
      this.handleImageReset()
      this.setState({ done: true })
    } catch (error) {
      console.log(error)
    }
  }
  render() {
    const { classes, updateForm } = this.props
    const { fileSelected } = this.state
    return (
      <ItemsContainer>
        {({ addItem, tagData: { loading, error, tags } }) => {
          if (loading) return <Spinner size={30} color="secondary" />
          if (addItem.loading) return <Spinner size={30} color="secondary" />
          return (
            <Form
              onSubmit={values => this.saveItem(values, addItem)}
              validate={validate}
              render={({ handleSubmit, submitting, pristine, invalid }) => (
                <form onSubmit={handleSubmit} className={classes.form}>
                  <FormSpy
                    subscription={{ values: true }}
                    component={({ values }) => {
                      if (Object.keys(values).length !== 0) {
                        this.dispatchUpdate(values, updateForm)
                      }
                      return ''
                    }}
                  />
                  <Typography className={classes.headline}>
                    Share. Borrow. Prosper.
                  </Typography>
                  <Field name="imageurl">
                    {(input, meta) => (
                      <Fragment>
                        <Button
                          variant={fileSelected ? 'outlined' : 'contained'}
                          color={fileSelected ? 'default' : 'primary'}
                          fullWidth
                          className={classes.uploadButton}
                          onClick={
                            fileSelected
                              ? this.handleImageReset
                              : this.handleImageUploadSelect
                          }
                        >
                          {fileSelected ? 'Reset Image' : 'Select an Image'}
                        </Button>
                        <Input
                          className={classes.fileUpload}
                          type="file"
                          inputRef={this.fileRef}
                          onChange={async event => {
                            await this.handleImageSelect(event)
                            this.dispatchUpdate(
                              { imageurl: 'selected' }, // allows redux to update the image
                              updateForm
                            )
                          }}
                        />
                      </Fragment>
                    )}
                  </Field>
                  <div>
                    <Field name="title">
                      {({ input, meta }) => (
                        <TextField
                          {...input}
                          onChange={e => {
                            const value = maxCharLength(55, e.target.value)
                            input.onChange(value)
                          }}
                          label="name your item"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                  </div>
                  <div>
                    <Field name="description">
                      {({ input, meta }) => (
                        <TextField
                          {...input}
                          onChange={e => {
                            const value = maxCharLength(150, e.target.value)
                            input.onChange(value)
                          }}
                          label="description"
                          autoComplete="off"
                          multiline
                          rows="4"
                        />
                      )}
                    </Field>
                  </div>
                  <div>
                    <Grid container justify="center">
                      {tags &&
                        tags.map(tag => (
                          <CheckBoxItem key={tag.id} tag={tag} />
                        ))}
                    </Grid>
                  </div>
                  <div>
                    {submitting ? (
                      <Spinner size={30} color="secondary" />
                    ) : (
                      <Button
                        variant="contained"
                        disabled={
                          submitting || pristine || invalid || !fileSelected
                        }
                        color="primary"
                        type="submit"
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                  <Typography className={classes.errorMessage}>
                    {addItem.error
                      ? 'Oops! Something went wrong please refresh the page and try again.'
                      : null}
                  </Typography>
                </form>
              )}
            />
          )
        }}
      </ItemsContainer>
    )
  }
}

ShareForm.propTypes = {
  classes: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
  resetImage: PropTypes.func.isRequired
}

export default connect(
  undefined,
  { updateForm, resetForm, resetImage }
)(withStyles(styles)(ShareForm))
