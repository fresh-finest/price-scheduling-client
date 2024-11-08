import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  const SettingsUserRoleSelect = ({ user, onRoleChange }) => {
    const handleChange = (role) => {
      onRoleChange(role, user);
    };
  
    return (
      <Select onValueChange={handleChange} defaultValue={user.role}>
        <SelectTrigger>
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };
  
  export default SettingsUserRoleSelect;