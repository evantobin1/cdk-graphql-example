import * as Assignment from "./assignment";
import * as Campaign from "./campaign";
import * as Door from "./door";
import * as Resident from "./resident";
import * as Route from "./route";
import * as Task from "./task";
import * as Volunteer from "./volunteer";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments:
    | Assignment.Assignment
    | Campaign.Campaign
    | Door.Door
    | Resident.Resident
    | Route.Route
    | Task.Task
    | Volunteer.Volunteer;
  identity: {
    username: string;
    claims: {
      [key: string]: string[];
    };
  };
};

exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "createAssignment":
      return await Assignment.createAssignment(event.arguments);
    case "updateAssignment":
      return await Assignment.updateAssignment(event.arguments.id);
    case "deleteAssignment":
      return await Assignment.deleteAssignment(event.arguments.id);
    case "getAssignment":
      return await Assignment.getAssignment(event.arguments.id);
    case "listAssignments":
      return await Assignment.listAssignments();

    case "createCampaign":
      return await Campaign.createCampaign(event.arguments);
    case "updateCampaign":
      return await Campaign.updateCampaign(event.arguments.id);
    case "deleteCampaign":
      return await Campaign.deleteCampaign(event.arguments.id);
    case "getCampaign":
      return await Campaign.getCampaign(event.arguments.id);
    case "listCampaigns":
      return await Campaign.listCampaigns();

    case "createDoor":
      return await Door.createDoor(event.arguments);
    case "updateDoor":
      return await Door.updateDoor(event.arguments.id);
    case "deleteDoor":
      return await Door.deleteDoor(event.arguments.id);
    case "getDoor":
      return await Door.getDoor(event.arguments.id);
    case "listDoors":
      return await Door.listDoors();

    case "createResident":
      return await Resident.createResident(event.arguments);
    case "updateResident":
      return await Resident.updateResident(event.arguments.id);
    case "deleteResident":
      return await Resident.deleteResident(event.arguments.id);
    case "getResident":
      return await Resident.getResident(event.arguments.id);
    case "listResidents":
      return await Resident.listResidents();

    case "createRoute":
      return await Route.createRoute(event.arguments);
    case "updateRoute":
      return await Route.updateRoute(event.arguments.id);
    case "deleteRoute":
      return await Route.deleteRoute(event.arguments.id);
    case "getRoute":
      return await Route.getRoute(event.arguments.id);
    case "listRoutes":
      return await Route.listRoutes();

    case "createTask":
      return await Task.createTask(event.arguments);
    case "updateTask":
      return await Task.updateTask(event.arguments.id);
    case "deleteTask":
      return await Task.deleteTask(event.arguments.id);
    case "getTask":
      return await Task.getTask(event.arguments.id);
    case "listTasks":
      return await Task.listTasks();

    case "createVolunteer":
      return await Volunteer.createVolunteer(event.arguments);
    case "updateVolunteer":
      return await Volunteer.updateVolunteer(event.arguments.id);
    case "deleteVolunteer":
      return await Volunteer.deleteVolunteer(event.arguments.id);
    case "getVolunteer":
      return await Volunteer.getVolunteer(event.arguments.id);
    case "listVolunteers":
      return await Volunteer.listVolunteers();
      
    default:
      return null;
  }
};
