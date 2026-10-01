import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

const API_URL =
  'https://contact-management-system-1-71qb.onrender.com/contacts';

const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'wrongpassword';

export default function HomeScreen() {
  // =========================
  // CONTACT STATE
  // =========================

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Contact | null>(null);

  const [isAdding, setIsAdding] = useState(false);

  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
  });

  // =========================
  // GET CONTACTS
  // =========================

  useEffect(() => {
    setContacts([]);
    setErrorMessage('');

    axios
      .get(API_URL, {
        auth: {
          username: AUTH_USERNAME,
          password: AUTH_PASSWORD,
        },
      })
      .then((response) => {
        console.log('GET CONTACTS RESPONSE:', response.data);

        const formattedContacts = response.data.map(
          (contact: any) => ({
            id: contact.id,
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: contact.email,
            contactNumber: contact.contact_number,
          })
        );

        setContacts(formattedContacts);
      })
      .catch((error: any) => {
        console.error('Failed to fetch contacts:', error);

        setContacts([]);

        if (error.response?.status === 401) {
          setErrorMessage(
            'Authentication failed: Invalid username or password.'
          );
        } else {
          setErrorMessage('Failed to load contacts.');
        }
      });
  }, []);

  // =========================
  // ADD USER
  // =========================

  const handleAddUser = () => {
    if (isAdding || editingId !== null) {
      return;
    }

    setErrorMessage('');
    setIsAdding(true);

    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);

    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
    });
  };

  // =========================
  // CREATE USER
  // =========================

  const handleCreate = async () => {
    setErrorMessage('');

    try {
      const response = await axios.post(
        API_URL,
        {
          first_name: newContact.firstName,
          last_name: newContact.lastName,
          email: newContact.email,
          contact_number: newContact.contactNumber,
        },
        {
          auth: {
            username: AUTH_USERNAME,
            password: AUTH_PASSWORD,
          },
        }
      );

      const createdContact = response.data.contact;

      const formattedContact: Contact = {
        id: createdContact.id,
        firstName: createdContact.first_name,
        lastName: createdContact.last_name,
        email: createdContact.email,
        contactNumber: createdContact.contact_number,
      };

      setContacts((currentContacts) => [
        formattedContact,
        ...currentContacts,
      ]);

      handleCancelAdd();
    } catch (error: any) {
      console.error('Create failed:', error);

      // =========================
      // AUTHENTICATION ERROR
      // =========================

      if (error.response?.status === 401) {
        setContacts([]);

        setErrorMessage(
          'Authentication failed: Invalid username or password.'
        );

        return;
      }

      // =========================
      // VALIDATION ERROR
      // =========================

      if (error.response?.status === 422) {
        const validationErrors =
          error.response.data?.detail;

        if (Array.isArray(validationErrors)) {
          const messages = validationErrors.map(
            (item: any) => {
              const field =
                item.loc?.[1] || 'Field';

              const message =
                item.msg || 'Invalid value';

              return `${field}: ${message}`;
            }
          );

          setErrorMessage(
            `Validation Error:\n${messages.join('\n')}`
          );
        } else {
          setErrorMessage(
            'Validation failed. Please check your input.'
          );
        }

        return;
      }

      // =========================
      // OTHER ERROR
      // =========================

      if (error.response) {
        setErrorMessage(
          `Create failed. Status: ${error.response.status}`
        );
      } else {
        setErrorMessage(
          `Create failed: ${error.message}`
        );
      }
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (contact: Contact) => {
    setErrorMessage('');
    setEditingId(contact.id);
    setEditData({ ...contact });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  // =========================
  // SAVE EDIT
  // =========================

  const handleSave = async () => {
    if (!editData) {
      return;
    }

    setErrorMessage('');

    try {
      await axios.put(
        `${API_URL}/${editData.id}`,
        {
          first_name: editData.firstName,
          last_name: editData.lastName,
          email: editData.email,
          contact_number: editData.contactNumber,
        },
        {
          auth: {
            username: AUTH_USERNAME,
            password: AUTH_PASSWORD,
          },
        }
      );

      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === editData.id
            ? editData
            : contact
        )
      );

      setEditingId(null);
      setEditData(null);
    } catch (error: any) {
      console.error('Update failed:', error);

      // Authentication error
      if (error.response?.status === 401) {
        setContacts([]);

        setErrorMessage(
          'Authentication failed: Invalid username or password.'
        );

        return;
      }

      // Validation error
      if (error.response?.status === 422) {
        const validationErrors =
        error.response.data?.detail;

      if (Array.isArray(validationErrors)) {
        const messages = validationErrors.map(
          (item: any) => {
            const field = item.loc?.[1];

            if (field === 'first_name') {
              return 'First name can contain lowercase letters only.';
            }

            if (field === 'last_name') {
              return 'Last name can contain lowercase letters only.';
            }

            if (field === 'email') {
              return 'Please enter a valid email address.';
            }

            if (field === 'contact_number') {
              return 'Contact number can contain numbers only.';
            }

            return 'Please check the entered details.';
      }
    );

    setErrorMessage(
      `Please fix the following:\n\n• ${messages.join(
        '\n• '
      )}`
    );

    return;
  }

  setErrorMessage(
    'Please check your details and try again.'
  );

  return;
}

      // Other error
      if (error.response) {
        setErrorMessage(
          `Update failed. Status: ${error.response.status}`
        );
      } else {
        setErrorMessage(
          `Update failed: ${error.message}`
        );
      }
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete?'
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage('');

    axios
      .delete(`${API_URL}/${id}`, {
        auth: {
          username: AUTH_USERNAME,
          password: AUTH_PASSWORD,
        },
      })
      .then(() => {
        setContacts((currentContacts) =>
          currentContacts.filter(
            (contact) => contact.id !== id
          )
        );
      })
      .catch((error: any) => {
        console.error('Delete failed:', error);

        if (error.response?.status === 401) {
          setContacts([]);

          setErrorMessage(
            'Authentication failed: Invalid username or password.'
          );
        } else {
          setErrorMessage(
            'Failed to delete contact.'
          );
        }
      });
  };

  // =========================
  // CONTACT PAGE
  // =========================

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Contact Management
        </Text>

        <View style={styles.headerButtons}>
          <Pressable
            style={styles.addButton}
            onPress={handleAddUser}
          >
            <Text style={styles.buttonText}>
              Add User
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ERROR MESSAGE */}

      {errorMessage !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* TABLE */}

      <ScrollView
        style={styles.verticalScroll}
        showsVerticalScrollIndicator={true}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
        >
          <View style={styles.table}>

            {/* TABLE HEADER */}

            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>
                ID
              </Text>

              <Text style={styles.headerCell}>
                First Name
              </Text>

              <Text style={styles.headerCell}>
                Last Name
              </Text>

              <Text style={styles.headerCell}>
                Email
              </Text>

              <Text style={styles.headerCell}>
                Contact Number
              </Text>

              <Text style={styles.headerCell}>
                Actions
              </Text>
            </View>

            {/* ADD USER ROW */}

            {isAdding && (
              <View style={styles.row}>

                <Text style={styles.cell}>
                  New
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={newContact.firstName}
                  onChangeText={(text) =>
                    setNewContact({
                      ...newContact,
                      firstName: text,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={newContact.lastName}
                  onChangeText={(text) =>
                    setNewContact({
                      ...newContact,
                      lastName: text,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={newContact.email}
                  onChangeText={(text) =>
                    setNewContact({
                      ...newContact,
                      email: text,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Contact Number"
                  value={newContact.contactNumber}
                  onChangeText={(text) =>
                    setNewContact({
                      ...newContact,
                      contactNumber: text,
                    })
                  }
                />

                <View style={styles.actions}>

                  <Pressable
                    style={styles.saveButton}
                    onPress={handleCreate}
                  >
                    <Text style={styles.buttonText}>
                      Save
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.cancelButton}
                    onPress={handleCancelAdd}
                  >
                    <Text style={styles.buttonText}>
                      Cancel
                    </Text>
                  </Pressable>

                </View>

              </View>
            )}

            {/* CONTACT ROWS */}

            {contacts.map((contact) => {
              const isEditing =
                editingId === contact.id;

              return (
                <View
                  style={styles.row}
                  key={contact.id}
                >

                  <Text style={styles.cell}>
                    {contact.id}
                  </Text>

                  {isEditing && editData ? (
                    <>

                      {/* FIRST NAME */}

                      <TextInput
                        style={styles.input}
                        value={editData.firstName}
                        onChangeText={(text) =>
                          setEditData({
                            ...editData,
                            firstName: text,
                          })
                        }
                      />

                      {/* LAST NAME */}

                      <TextInput
                        style={styles.input}
                        value={editData.lastName}
                        onChangeText={(text) =>
                          setEditData({
                            ...editData,
                            lastName: text,
                          })
                        }
                      />

                      {/* EMAIL */}

                      <TextInput
                        style={styles.input}
                        value={editData.email}
                        onChangeText={(text) =>
                          setEditData({
                            ...editData,
                            email: text,
                          })
                        }
                      />

                      {/* CONTACT NUMBER */}

                      <TextInput
                        style={styles.input}
                        value={editData.contactNumber}
                        onChangeText={(text) =>
                          setEditData({
                            ...editData,
                            contactNumber: text,
                          })
                        }
                      />

                      {/* ACTIONS */}

                      <View style={styles.actions}>

                        <Pressable
                          style={styles.saveButton}
                          onPress={handleSave}
                        >
                          <Text style={styles.buttonText}>
                            Save
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.cancelButton}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.buttonText}>
                            Cancel
                          </Text>
                        </Pressable>

                      </View>

                    </>
                  ) : (
                    <>

                      {/* FIRST NAME */}

                      <Text style={styles.cell}>
                        {contact.firstName}
                      </Text>

                      {/* LAST NAME */}

                      <Text style={styles.cell}>
                        {contact.lastName}
                      </Text>

                      {/* EMAIL */}

                      <Text style={styles.cell}>
                        {contact.email}
                      </Text>

                      {/* CONTACT NUMBER */}

                      <Text style={styles.cell}>
                        {contact.contactNumber}
                      </Text>

                      {/* ACTIONS */}

                      <View style={styles.actions}>

                        <Pressable
                          style={styles.editButton}
                          onPress={() =>
                            handleEdit(contact)
                          }
                        >
                          <Text style={styles.buttonText}>
                            Edit
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.deleteButton}
                          onPress={() =>
                            handleDelete(contact.id)
                          }
                        >
                          <Text style={styles.buttonText}>
                            Delete
                          </Text>
                        </Pressable>

                      </View>

                    </>
                  )}

                </View>
              );
            })}

          </View>
        </ScrollView>
      </ScrollView>

    </View>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  verticalScroll: {
    flex: 1,
  },

  table: {
    minWidth: 950,
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    paddingVertical: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },

  headerCell: {
    width: 150,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },

  cell: {
    width: 150,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  input: {
    width: 150,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 2,
    backgroundColor: '#fff',
  },

  actions: {
    width: 180,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 5,
  },

  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  cancelButton: {
    backgroundColor: '#777',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // =========================
  // ERROR MESSAGE
  // =========================

  errorBox: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },

  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    lineHeight: 22,
  },

});
