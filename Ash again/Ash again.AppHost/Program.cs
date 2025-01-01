var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Ash again>("ash again");

builder.Build().Run();
