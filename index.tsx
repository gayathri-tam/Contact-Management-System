import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

const API_URL =
  'https://fastapi-contact-api-7bqo.onrender.com/contacts';

export default function HomeScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);

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
    axios
      .get(API_URL)
      .then((response) => {
        const mappedContacts = response.data.map(
          (contact: any) => ({
            id: contact.id,
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: contact.email,
            contactNumber: contact.contact_number,
          })
        );

        setContacts(mappedContacts);
      })
      .catch((error) => {
        console.error(
          'Failed to fetch contacts:',
          error
        );
      });
  }, []);

  // =========================
  // ADD USER BUTTON
  // =========================

  const handleAddUser = () => {
    setIsAdding(true);

    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
    });
  };

  // =========================
  // CANCEL ADD
  // =========================

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
  // POST -> FASTAPI -> MONGODB
  // =========================

  const handleCreate = async () => {
    try {
      const response = await axios.post(API_URL, {
        first_name: newContact.firstName,
        last_name: newContact.lastName,
        email: newContact.email,
        contact_number: newContact.contactNumber,
      });

      const createdContact = response.data.contact;

      const mappedContact: Contact = {
        id: createdContact.id,
        firstName: createdContact.first_name,
        lastName: createdContact.last_name,
        email: createdContact.email,
        contactNumber: createdContact.contact_number,
      };

      setContacts((currentContacts) => [
        mappedContact,
        ...currentContacts,
      ]);

      setIsAdding(false);

      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
      });
    } catch (error: any) {
      console.error('Create failed:', error);

      if (error.response) {
        console.error(
          'Status:',
          error.response.status
        );

        console.error(
          'Response:',
          error.response.data
        );

        window.alert(
          `Create failed\n\nStatus: ${
            error.response.status
          }\n\n${JSON.stringify(
            error.response.data,
            null,
            2
          )}`
        );
      } else if (error.request) {
        console.error(
          'No response received:',
          error.request
        );

        window.alert(
          'Create failed\n\nNo response received from the FastAPI server.'
        );
      } else {
        console.error(
          'Error:',
          error.message
        );

        window.alert(
          `Create failed\n\n${error.message}`
        );
      }
    }
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditData({ ...contact });
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  // =========================
  // SAVE EDIT
  // PUT -> FASTAPI -> MONGODB
  // =========================

  const handleSave = async () => {
    if (!editData) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/${editData.id}`,
        {
          first_name: editData.firstName,
          last_name: editData.lastName,
          email: editData.email,
          contact_number:
            editData.contactNumber,
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
      console.error(
        'Update failed:',
        error
      );

      if (error.response) {
        window.alert(
          `Update failed\n\nStatus: ${
            error.response.status
          }\n\n${JSON.stringify(
            error.response.data,
            null,
            2
          )}`
        );
      } else {
        window.alert(
          `Update failed\n\n${
            error.message
          }`
        );
      }
    }
  };

  // =========================
  // DELETE USER
  // DELETE -> FASTAPI -> MONGODB
  // =========================

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete?'
    );

    if (!confirmed) {
      return;
    }

    axios
      .delete(`${API_URL}/${id}`)
      .then(() => {
        setContacts((currentContacts) =>
          currentContacts.filter(
            (contact) =>
              contact.id !== id
          )
        );
      })
      .catch((error) => {
        console.error(
          'Delete failed:',
          error
        );

        window.alert(
          'Failed to delete contact'
        );
      });
  };

  // =========================
  // UI
  // =========================

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Contacts
      </Text>

      {/* ADD USER BUTTON */}

      <Pressable
        style={styles.addButton}
        onPress={handleAddUser}
      >
        <Text style={styles.addButtonText}>
          + Add User
        </Text>
      </Pressable>
      <ScrollView
       style={styles.verticalScroll}
        showsVerticalScrollIndicator={true}
        >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          true
        }
      >
        <View>

          {/* TABLE HEADER */}

          <View style={styles.headerRow}>
            <Text
              style={[
                styles.headerCell,
                styles.idCell,
              ]}
            >
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

            <Text
              style={[
                styles.headerCell,
                styles.actionCell,
              ]}
            >
              Actions
            </Text>
          </View>

          {/* =========================
              NEW USER ROW
          ========================= */}

          {isAdding && (
            <View style={styles.row}>
              <Text
                style={[
                  styles.cell,
                  styles.idCell,
                ]}
              >
                —
              </Text>

              <TextInput
                style={styles.input}
                value={
                  newContact.firstName
                }
                onChangeText={(text) =>
                  setNewContact({
                    ...newContact,
                    firstName: text,
                  })
                }
                placeholder="First Name"
              />

              <TextInput
                style={styles.input}
                value={
                  newContact.lastName
                }
                onChangeText={(text) =>
                  setNewContact({
                    ...newContact,
                    lastName: text,
                  })
                }
                placeholder="Last Name"
              />

              <TextInput
                style={styles.input}
                value={
                  newContact.email
                }
                onChangeText={(text) =>
                  setNewContact({
                    ...newContact,
                    email: text,
                  })
                }
                placeholder="Email"
              />

              <TextInput
                style={styles.input}
                value={
                  newContact.contactNumber
                }
                onChangeText={(text) =>
                  setNewContact({
                    ...newContact,
                    contactNumber: text,
                  })
                }
                placeholder="Contact Number"
                keyboardType="numeric"
              />

              <View
                style={
                  styles.actionCell
                }
              >
                <Pressable
                  style={
                    styles.saveButton
                  }
                  onPress={
                    handleCreate
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Save
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.cancelButton
                  }
                  onPress={
                    handleCancelAdd
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* =========================
              EXISTING CONTACTS
          ========================= */}

          {contacts.map((contact) => {
            const isEditing =
              editingId ===
              contact.id;

            const currentData =
              isEditing && editData
                ? editData
                : contact;

            return (
              <View
                key={contact.id}
                style={styles.row}
              >
                {/* ID */}

                <Text
                  style={[
                    styles.cell,
                    styles.idCell,
                  ]}
                >
                  {contact.id}
                </Text>

                {/* FIRST NAME */}

                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={
                      currentData.firstName
                    }
                    onChangeText={(text) =>
                      setEditData({
                        ...currentData,
                        firstName: text,
                      })
                    }
                  />
                ) : (
                  <Text
                    style={styles.cell}
                  >
                    {
                      contact.firstName
                    }
                  </Text>
                )}

                {/* LAST NAME */}

                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={
                      currentData.lastName
                    }
                    onChangeText={(text) =>
                      setEditData({
                        ...currentData,
                        lastName: text,
                      })
                    }
                  />
                ) : (
                  <Text
                    style={styles.cell}
                  >
                    {
                      contact.lastName
                    }
                  </Text>
                )}

                {/* EMAIL */}

                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={
                      currentData.email
                    }
                    onChangeText={(text) =>
                      setEditData({
                        ...currentData,
                        email: text,
                      })
                    }
                  />
                ) : (
                  <Text
                    style={styles.cell}
                  >
                    {contact.email}
                  </Text>
                )}

                {/* CONTACT NUMBER */}

                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={
                      currentData.contactNumber
                    }
                    onChangeText={(text) =>
                      setEditData({
                        ...currentData,
                        contactNumber:
                          text,
                      })
                    }
                    keyboardType="numeric"
                  />
                ) : (
                  <Text
                    style={styles.cell}
                  >
                    {
                      contact.contactNumber
                    }
                  </Text>
                )}

                {/* ACTIONS */}

                <View
                  style={
                    styles.actionCell
                  }
                >
                  {isEditing ? (
                    <>
                      <Pressable
                        style={
                          styles.saveButton
                        }
                        onPress={
                          handleSave
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Save
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          styles.cancelButton
                        }
                        onPress={
                          handleCancel
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Cancel
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={
                          styles.editButton
                        }
                        onPress={() =>
                          handleEdit(
                            contact
                          )
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Edit
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          styles.deleteButton
                        }
                        onPress={() =>
                          handleDelete(
                            contact.id
                          )
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Delete
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
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

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#aaa',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#aaa',
  },

  headerCell: {
    width: 180,
    padding: 12,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderColor: '#aaa',
  },

  cell: {
    width: 180,
    padding: 12,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },

  idCell: {
    width: 70,
  },

  input: {
    width: 180,
    height: 42,
    margin: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  actionCell: {
    width: 180,
    padding: 5,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },

  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },

  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },

  cancelButton: {
    backgroundColor: '#777',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  verticalScroll: {
  flex: 1,
},
});